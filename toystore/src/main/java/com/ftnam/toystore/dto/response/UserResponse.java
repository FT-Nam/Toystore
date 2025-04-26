package com.ftnam.toystore.dto.response;

import com.ftnam.toystore.enums.Provider;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;

    private String firstname;

    private String lastname;

    private String avatar;

    private String username;

    private String address;

    private String email;

    private String phone;

    private Provider provider;

    private String providerId;

    Set<String> roles;

    private LocalDateTime createdAt;
}
