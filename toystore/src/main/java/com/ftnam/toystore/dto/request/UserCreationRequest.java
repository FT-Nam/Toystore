package com.ftnam.toystore.dto.request;

import com.ftnam.toystore.enums.Provider;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationRequest {
    @NotBlank
    private String firstname;

    @NotBlank
    private String lastname;

    private String avatar;

    @NotBlank
    @Size(min = 5)
    private String username;

    @NotBlank
    @Size(min = 7)
    private String password;

    @NotBlank
    private String address;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^(\\+\\d{1,3})?[- .]?\\d{10,15}$")
    private String phone;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    private String providerId;

    private Set<String> role;
}
