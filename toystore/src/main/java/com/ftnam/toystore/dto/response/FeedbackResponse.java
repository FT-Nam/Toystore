package com.ftnam.toystore.dto.response;

import com.ftnam.toystore.enums.StatusFeedback;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String content;

    private StatusFeedback statusFeedback;

    private LocalDate createdAt;
}
