package com.ftnam.toystore.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ftnam.toystore.entity.Category;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String brand;

    @NotBlank
    private String thumbnail;

    @NotBlank
    private String description;

    // Giá phải lớn hơn 0, inclusive = false để không bao gồm giá trị 0.0
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private Integer discountPercentage;

    @NotBlank
    private int stock;

    @NotEmpty
    private Set<Long> categoryIds;

    @JsonProperty("isNew")
    private boolean isNew;

    @JsonProperty("isBestSeller")
    private boolean isBestSeller;

    @JsonProperty("isSale")
    private boolean isSale;
}
