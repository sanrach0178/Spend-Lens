package com.credex.spendlens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditRequest {
    private List<ToolEntryDto> tools;
    private Integer teamSize;
    private String primaryUseCase;
    
    // The frontend sends the FULL calculated audit result in the request body.
    private AuditResponse calculatedResult; 
}
