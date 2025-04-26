package com.ftnam.toystore.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    String accessToken;
    String refreshToken;
}
