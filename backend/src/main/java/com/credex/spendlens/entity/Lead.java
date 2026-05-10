package com.credex.spendlens.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    private UUID id;

    @Column(name = "audit_id", nullable = false)
    private UUID auditId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "role")
    private String role;

    @Column(name = "team_size")
    private Integer teamSize;

    @Column(name = "is_high_savings")
    private Boolean isHighSavings;

    @Column(name = "email_sent")
    private Boolean emailSent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "honeypot")
    private String honeypot;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isHighSavings == null) {
            isHighSavings = false;
        }
        if (emailSent == null) {
            emailSent = false;
        }
    }
}
