package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.CartResponse;
import com.ftnam.toystore.entity.Cart;
import com.ftnam.toystore.entity.User;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.CartMapper;
import com.ftnam.toystore.repository.CartRepository;
import com.ftnam.toystore.repository.UserRepository;
import com.ftnam.toystore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    public Page<CartResponse> getAllCart(Pageable pageable) {
        return cartRepository.findAll(pageable).map(cartMapper::toCartResponse);
    }

    @Override
    public CartResponse getCartByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        return cartMapper.toCartResponse(user.getCart());
    }

    @PreAuthorize("hasAuthority('CART_CLEAR')")
    @Override
    public void clearCart(Long id) {

    }
}
