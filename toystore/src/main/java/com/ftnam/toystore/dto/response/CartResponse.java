package com.ftnam.toystore.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;

    private Long userId;
}
