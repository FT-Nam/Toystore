package com.ftnam.toystore.dto.request;

import jakarta.servlet.http.HttpServletRequest;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private long amount;
    private String bankCode;
    private String ipAddress;
    private String language;
}
