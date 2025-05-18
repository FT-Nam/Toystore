package com.ftnam.toystore.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.math.BigDecimal;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    private String name;

    private String brand;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private Integer discountPercentage;

    private int stock;

    private Set<Long> categoryIds;

    @JsonProperty("isNew")
    private boolean isNew;

    @JsonProperty("isBestSeller")
    private boolean isBestSeller;

    @JsonProperty("isSale")
    private boolean isSale;
}
