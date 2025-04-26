package com.ftnam.toystore.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemCreationRequest {
    @NotNull
    private Long cartId;

    @NotNull
    private Long productId;

    @NotNull
    private int quantity;
}
