package com.ftnam.toystore.dto.request;

import com.ftnam.toystore.entity.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImgUpdateRequest {
    private String imgUrl;

    private Long productId;
}
