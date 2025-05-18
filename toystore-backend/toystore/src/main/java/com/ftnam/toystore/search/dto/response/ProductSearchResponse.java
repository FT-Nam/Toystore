package com.ftnam.toystore.search.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSearchResponse {
    Long id;
    String name;
    String thumbnail;
    BigDecimal price;
    Integer discountPercentage;
    int stock;
    boolean isNew;
    boolean isBestSeller;
    boolean isSale;
}
