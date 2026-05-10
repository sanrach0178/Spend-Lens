package com.credex.spendlens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolAuditResultDto {
    private String toolId;
    private String currentPlan;
    private String recommendedPlan;
    private BigDecimal monthlySavings;
    private BigDecimal annualSavings;
    private List<String> alternatives;
    private String reason;
}
