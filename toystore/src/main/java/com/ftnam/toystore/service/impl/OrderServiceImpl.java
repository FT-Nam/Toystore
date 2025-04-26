package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.OrderCreationRequest;
import com.ftnam.toystore.dto.request.OrderUpdateRequest;
import com.ftnam.toystore.dto.response.OrderItemResponse;
import com.ftnam.toystore.dto.response.OrderResponse;
import com.ftnam.toystore.entity.*;
import com.ftnam.toystore.enums.StatusOrder;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.OrderItemMapper;
import com.ftnam.toystore.mapper.OrderMapper;
import com.ftnam.toystore.repository.*;
import com.ftnam.toystore.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemMapper orderItemMapper;
    private final ProductRepository productRepository;

    @PreAuthorize("hasAuthority('ORDER_CREATE')")
    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        Order order = orderMapper.toOrder(request);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        order.setUser(user);
        Cart cart = user.getCart();
        if(cart == null){
            throw new AppException(ErrorCode.CART_ITEM_EMPTY);
        }
        List<OrderItem> orderItems = new ArrayList<>();
        for(CartItem cartItem: cart.getCartItems()){
            OrderItem orderItem = new OrderItem();
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(()->new AppException(ErrorCode.ID_NOT_EXISTED));
            orderItem.setOrder(order);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setProduct(product);
            orderItem.setPrice(cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            orderItems.add(orderItem);
        }
        BigDecimal totalPrice = orderItems.stream()
                .map(OrderItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);

        order = orderRepository.save(order);

        orderItems.forEach(orderItemRepository::save);

        user.setCart(null);
        cartItemRepository.deleteAll(cart.getCartItems());
        cartRepository.deleteById(cart.getId());

        return orderMapper.toOrderResponse(order);
    }

    @PreAuthorize("hasAuthority('ORDER_MANAGE_OWN')")
    @Override
    public List<OrderResponse> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()->new AppException(ErrorCode.ID_NOT_EXISTED));
        return user.getOrders().stream().map(orderMapper::toOrderResponse).toList();
    }

    @Override
    public List<OrderItemResponse> getOrderItemsByOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        return order.getOrderItems().stream().map(orderItemMapper::toOrderItemResponse).toList();
    }

    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    @Override
    public Page<OrderResponse> getAllOrder(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toOrderResponse);
    }

    @Override
    public OrderResponse updateStatus(OrderUpdateRequest request, Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        orderMapper.updateOrder(order,request);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @PreAuthorize("hasAuthority('ORDER_CANCEL')")
    public void cancelOrder(Long id){
        Order order = orderRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Set<String> authorities = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());

        if(!order.getUser().getUsername().equals(username) && !authorities.contains("ROLE_ADMIN")){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        order.setStatus(StatusOrder.CANCELLED);
        orderRepository.save(order);
    }


}
