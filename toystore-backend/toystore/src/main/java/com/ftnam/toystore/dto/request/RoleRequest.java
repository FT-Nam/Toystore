package com.ftnam.toystore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {
    @NotBlank
    String name;

    @NotBlank
    String description;

    Set<String> permissions;
}
