package com.ftnam.toystore.search.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterRequest {
    String name;

    boolean isNew;
    boolean isSale;
    boolean isBestSeller;

    BigDecimal minPrice;

    BigDecimal maxPrice;
}
