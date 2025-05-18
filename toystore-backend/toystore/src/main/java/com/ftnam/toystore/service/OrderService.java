package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.OrderCreationRequest;
import com.ftnam.toystore.dto.request.OrderUpdateRequest;
import com.ftnam.toystore.dto.response.OrderItemResponse;
import com.ftnam.toystore.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderCreationRequest request);

    List<OrderResponse> getOrdersByUser(Long userId);

    List<OrderItemResponse> getOrderItemsByOrder(Long orderId);

    Page<OrderResponse> getAllOrder(Pageable pageable);

    OrderResponse updateStatus(OrderUpdateRequest request, Long id);

    void cancelOrder(Long id);
}
