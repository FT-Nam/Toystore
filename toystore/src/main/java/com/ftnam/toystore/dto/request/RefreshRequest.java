package com.ftnam.toystore.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequest {
    private String token;
}
