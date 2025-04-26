package com.ftnam.toystore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String firstname;

    private String lastname;

    @Size(min = 5)
    private String username;

    @Size(min = 7)
    private String password;

    private String address;

    @Email
    private String email;

    @Pattern(regexp = "^(\\+\\d{1,3})?[- .]?\\d{10,15}$")
    private String phone;
}
