package com.credex.spendlens.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Audit {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    private UUID id;

    @Column(name = "public_id", nullable = false, unique = true)
    private String publicId;

    @Column(name = "tools_json", nullable = false, columnDefinition = "TEXT")
    private String toolsJson;

    @Column(name = "audit_result_json", nullable = false, columnDefinition = "TEXT")
    private String auditResultJson;

    @Column(name = "total_monthly_savings")
    private BigDecimal totalMonthlySavings;

    @Column(name = "total_annual_savings")
    private BigDecimal totalAnnualSavings;

    @Column(name = "team_size")
    private Integer teamSize;

    @Column(name = "primary_use_case")
    private String primaryUseCase;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ip_hash", nullable = false)
    private String ipHash;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
