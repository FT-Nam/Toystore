package com.ftnam.toystore.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;

    private Long cartId;

    private Long productId;

    private int quantity;

    private BigDecimal price;
}
