package com.ftnam.toystore.dto.request;

import com.ftnam.toystore.enums.StatusFeedback;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackUpdateRequest {
    private String name;

    @Email
    private String email;

    @Pattern(regexp = "^(\\+\\d{1,3})?[- .]?\\d{10,15}$")
    private String phone;

    private String content;

    @Enumerated(EnumType.STRING)
    private StatusFeedback statusFeedback;

}
