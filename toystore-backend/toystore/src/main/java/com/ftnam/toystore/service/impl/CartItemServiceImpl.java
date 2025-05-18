package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.CartItemCreationRequest;
import com.ftnam.toystore.dto.request.CartItemUpdateRequest;
import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.CartItemResponse;
import com.ftnam.toystore.entity.Cart;
import com.ftnam.toystore.entity.CartItem;
import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.entity.User;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.CartItemMapper;
import com.ftnam.toystore.mapper.CartMapper;
import com.ftnam.toystore.repository.CartItemRepository;
import com.ftnam.toystore.repository.CartRepository;
import com.ftnam.toystore.repository.ProductRepository;
import com.ftnam.toystore.repository.UserRepository;
import com.ftnam.toystore.service.CartItemService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService {
    private final CartItemRepository cartItemRepository;
    private final CartItemMapper cartItemMapper;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @PreAuthorize("hasAuthority('CART_ADD_ITEM')")
    @Override
    @Transactional
    public CartItemResponse addToCart(CartRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));

        String id = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!user.getId().equals(Long.valueOf(id))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Cart cart = user.getCart();

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }


        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product);

            if (cartItem == null) {
                cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setProduct(product);
                cartItem.setQuantity(request.getQuantity());
                cartItem.setPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            } else {
                cartItem.setQuantity(request.getQuantity() + cartItem.getQuantity());
            }

        return cartItemMapper.toCartItemResponse(cartItemRepository.save(cartItem));
    }

    @Override
    public Page<CartItemResponse> getAllCartItem(Pageable pageable) {
        return cartItemRepository.findAll(pageable).map(cartItemMapper::toCartItemResponse);
    }

    @PreAuthorize("hasAuthority('CART_VIEW_OWN')")
    @Override
    public List<CartItemResponse> getCartItemsByCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        return cart.getCartItems().stream().map(cartItemMapper::toCartItemResponse).toList();
    }

    @PreAuthorize("hasAuthority('CART_UPDATE_OWN')")
    @Override
    public CartItemResponse updateCartItem(Long id, CartItemUpdateRequest request) {
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        Product product = productRepository.findById(cartItem.getProduct().getId())
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        cartItem.setQuantity(request.getQuantity());
        cartItem.setPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        CartItemResponse cartItemResponse = CartItemResponse.builder()
                .id(cartItem.getId())
                .cartId(cartItem.getCart().getId())
                .productId(cartItem.getProduct().getId())
                .quantity(cartItem.getQuantity())
                .price(cartItem.getPrice())
                .build();

        cartItemRepository.save(cartItem);
        return cartItemResponse;
    }

    @PreAuthorize("hasAuthority('CART_REMOVE_ITEM')")
    @Override
    public void deleteCartItem(Long id) {
        cartItemRepository.deleteById(id);
    }
}
