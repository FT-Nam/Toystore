package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.CartItemCreationRequest;
import com.ftnam.toystore.dto.request.CartItemUpdateRequest;
import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.CartItemResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.service.impl.CartItemServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartItemController {
    private final CartItemServiceImpl cartItemService;

    @PostMapping("/add-to-cart")
    ApiResponse<CartItemResponse> addToCart(@RequestBody CartRequest request){
        return ApiResponse.<CartItemResponse>builder()
                .value(cartItemService.addToCart(request))
                .message("Add to cart successfully")
                .build();
    }

    @GetMapping("/cart-detail")
    ApiResponse<List<CartItemResponse>> getAllCartItem(Pageable pageable){
        Page<CartItemResponse> cartItemResponsePage = cartItemService.getAllCartItem(pageable);
        return ApiResponse.<List<CartItemResponse>>builder()
                .value(cartItemResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(cartItemResponsePage.getNumber())
                        .size(cartItemResponsePage.getSize())
                        .totalElements(cartItemResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/{cartId}")
    ApiResponse<List<CartItemResponse>> getCartItemsByCart(@PathVariable Long cartId){
        return ApiResponse.<List<CartItemResponse>>builder()
                .value(cartItemService.getCartItemsByCart(cartId))
                .build();
    }

    @PutMapping("/cart-detail/{id}")
    ApiResponse<CartItemResponse> updateCartItem(@PathVariable Long id, @RequestBody @Valid CartItemUpdateRequest request){
        return ApiResponse.<CartItemResponse>builder()
                .value(cartItemService.updateCartItem(id, request))
                .message("Update cart item has been successfully")
                .build();
    }

    @DeleteMapping("/cart-detail/{id}")
    ApiResponse<Void> deleteCartItem(@PathVariable Long id){
        cartItemService.deleteCartItem(id);
        return ApiResponse.<Void>builder()
                .message("Delete cart item has been successfully")
                .build();
    }

}
