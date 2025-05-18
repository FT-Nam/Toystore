package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.CartItemCreationRequest;
import com.ftnam.toystore.dto.request.CartItemUpdateRequest;
import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.CartItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CartItemService {
    CartItemResponse addToCart(CartRequest request);

    Page<CartItemResponse> getAllCartItem(Pageable pageable);

    List<CartItemResponse> getCartItemsByCart(Long cartId);

    CartItemResponse updateCartItem(Long id, CartItemUpdateRequest request);

    void deleteCartItem(Long id);
}
