package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.CartResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CartService {
    Page<CartResponse> getAllCart(Pageable pageable);

    CartResponse getCartByUser(Long userId);

    void clearCart(Long id);
}
