package com.ftnam.toystore.search.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductTypeRequest {
    boolean isNew;
    boolean isSale;
    boolean isBestSeller;

    BigDecimal minPrice;

    BigDecimal maxPrice;
}
