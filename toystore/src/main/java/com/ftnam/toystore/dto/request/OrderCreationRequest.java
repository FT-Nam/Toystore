package com.ftnam.toystore.dto.request;

import com.ftnam.toystore.enums.StatusOrder;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreationRequest {
    @NotNull
    private Long userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private StatusOrder status;

    @NotNull
    private BigDecimal shippingFee;

    @NotBlank
    private String paymentMethod;

    @NotNull
    private String address;

}
