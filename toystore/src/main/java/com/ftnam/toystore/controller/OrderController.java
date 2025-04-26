package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.OrderCreationRequest;
import com.ftnam.toystore.dto.request.OrderUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.OrderItemResponse;
import com.ftnam.toystore.dto.response.OrderResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.service.impl.OrderServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderServiceImpl orderService;

    @PostMapping
    ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderCreationRequest request){
        return ApiResponse.<OrderResponse>builder()
                .message("Create order has been successfully")
                .value(orderService.createOrder(request))
                .build();
    }

    @GetMapping("/user/{userId}")
    ApiResponse<List<OrderResponse>> getOrdersByUser(@PathVariable Long userId){
        return ApiResponse.<List<OrderResponse>>builder()
                .value(orderService.getOrdersByUser(userId))
                .build();
    }

    @GetMapping("/order-detail/{orderId}")
    ApiResponse<List<OrderItemResponse>> getOrderItemsByOrder(@PathVariable Long orderId){
        return ApiResponse.<List<OrderItemResponse>>builder()
                .value(orderService.getOrderItemsByOrder(orderId))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<OrderResponse> updateStatus(@PathVariable Long id, @RequestBody OrderUpdateRequest request){
        return ApiResponse.<OrderResponse>builder()
                .value(orderService.updateStatus(request,id))
                .message("Update status successfully")
                .build();
    }

    @GetMapping
    ApiResponse<List<OrderResponse>> getAllOrder(Pageable pageable){
        Page<OrderResponse> orderResponsePage = orderService.getAllOrder(pageable);
        return ApiResponse.<List<OrderResponse>>builder()
                .value(orderResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(orderResponsePage.getNumber())
                        .size(orderResponsePage.getSize())
                        .totalElements(orderResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @PutMapping("/cancel/{id}")
    ApiResponse<Void> cancelOrder(@PathVariable Long id){
        orderService.cancelOrder(id);
        return ApiResponse.<Void>builder()
                .message("Order canceled has been successfully")
                .build();
    }
}
