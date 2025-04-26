package com.ftnam.toystore.dto.response;

import com.ftnam.toystore.enums.StatusOrder;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;

    private Long userId;

    private StatusOrder status;

    private BigDecimal totalPrice;

    private BigDecimal shippingFee;

    private String address;

    private String paymentMethod;

    private LocalDateTime createdAt;
}
