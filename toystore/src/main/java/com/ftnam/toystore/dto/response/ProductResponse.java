package com.ftnam.toystore.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ftnam.toystore.entity.CartItem;
import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.entity.OrderItem;
import com.ftnam.toystore.entity.ProductImg;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponse {
    private Long id;

    private String name;

    private String thumbnail;

    private String brand;

    private String description;

    private BigDecimal price;

    private Integer discountPercentage;

    private int stock;

    private Set<Long> categoryIds;

    private boolean isNew;

    private boolean isBestSeller;

    private boolean isSale;

    private LocalDateTime createdAt;

}
