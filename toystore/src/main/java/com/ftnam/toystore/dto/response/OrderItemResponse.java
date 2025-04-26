package com.ftnam.toystore.dto.response;

import com.ftnam.toystore.entity.Order;
import com.ftnam.toystore.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;

    private Long orderId;

    private Long productId;

    private int quantity;

    private BigDecimal price;
}
