package com.ftnam.toystore.entity;

import com.ftnam.toystore.enums.StatusFeedback;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Email
    @Column(name = "email", length = 50)
    private String email;

    @Column(name = "phone", length = 12)
    @Pattern(regexp = "^(\\+\\d{1,3})?[- .]?\\d{10,15}$")
    private String phone;

    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusFeedback statusFeedback;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDate createdAt;
}
