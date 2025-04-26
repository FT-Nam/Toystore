package com.ftnam.toystore.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfoResponse {
    private String id;
    private String email;
    private String name;
    private String picture;
}
