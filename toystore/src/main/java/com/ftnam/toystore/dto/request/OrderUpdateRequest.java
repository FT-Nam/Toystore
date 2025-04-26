package com.ftnam.toystore.dto.request;

import com.ftnam.toystore.enums.StatusOrder;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {
    private StatusOrder status;
}
