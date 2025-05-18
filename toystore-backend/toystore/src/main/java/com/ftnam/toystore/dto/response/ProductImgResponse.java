package com.ftnam.toystore.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImgResponse {
    private Long id;

    private String imgUrl;

    private Long productId;
}
