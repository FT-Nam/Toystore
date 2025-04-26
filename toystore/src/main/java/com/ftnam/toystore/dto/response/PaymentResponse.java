package com.ftnam.toystore.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String code;
    private String message;
    private String data;
}
