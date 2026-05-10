package com.credex.spendlens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadCaptureRequest {
    private String auditId;
    private String email;
    private String companyName;
    private String role;
    private Integer teamSize;
    private String website; // honeypot
}
