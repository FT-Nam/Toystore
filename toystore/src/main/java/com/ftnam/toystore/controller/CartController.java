package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.CartResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.service.CartService;
import com.ftnam.toystore.service.impl.CartServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartServiceImpl cartService;

    @GetMapping
    public ApiResponse<List<CartResponse>> getAllCart(Pageable pageable){
        Page<CartResponse> cartResponsePage = cartService.getAllCart(pageable);
        return ApiResponse.<List<CartResponse>>builder()
                .value(cartResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(cartResponsePage.getNumber())
                        .size(cartResponsePage.getSize())
                        .totalElements(cartResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<CartResponse> getCartByUser(@PathVariable Long userId){
        return ApiResponse.<CartResponse>builder()
                .value(cartService.getCartByUser(userId))
                .build();
    }
}
