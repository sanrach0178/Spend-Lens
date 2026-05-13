package com.spendlens.backend;

import com.credex.spendlens.controller.AuditController;
import com.credex.spendlens.dto.AuditRequest;
import com.credex.spendlens.dto.AuditResponse;
import com.credex.spendlens.dto.ToolAuditResultDto;
import com.credex.spendlens.dto.ToolEntryDto;
import com.credex.spendlens.service.AuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuditController auditController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(auditController).build();
    }

    @Test
    @DisplayName("POST /api/audit/run returns 200 with valid request body")
    void createAudit_validBody_returns200() throws Exception {
        AuditResponse mockResponse = AuditResponse.builder()
                .auditId("abc1234567")
                .tools(List.of(
                        ToolAuditResultDto.builder()
                                .toolId("cursor")
                                .currentPlan("pro")
                                .recommendedPlan("pro")
                                .monthlySavings(BigDecimal.ZERO)
                                .annualSavings(BigDecimal.ZERO)
                                .reason("Current plan is optimal.")
                                .build()
                ))
                .totalMonthlySavings(BigDecimal.ZERO)
                .totalAnnualSavings(BigDecimal.ZERO)
                .showCredex(false)
                .summary("Your setup looks optimal.")
                .build();

        when(auditService.createAudit(any(AuditRequest.class), anyString()))
                .thenReturn(mockResponse);

        AuditRequest request = AuditRequest.builder()
                .tools(List.of(
                        ToolEntryDto.builder()
                                .toolId("cursor")
                                .plan("pro")
                                .monthlySpend(new BigDecimal("20"))
                                .seats(1)
                                .build()
                ))
                .teamSize(1)
                .primaryUseCase("coding")
                .calculatedResult(mockResponse)
                .build();

        mockMvc.perform(post("/api/audit/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.auditId").value("abc1234567"))
                .andExpect(jsonPath("$.totalMonthlySavings").value(0))
                .andExpect(jsonPath("$.showCredex").value(false));
    }

    @Test
    @DisplayName("POST /api/audit/run returns 429 when rate limit is exceeded")
    void createAudit_rateLimitExceeded_returns429() throws Exception {
        when(auditService.createAudit(any(AuditRequest.class), anyString()))
                .thenThrow(new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded"));

        AuditRequest request = AuditRequest.builder()
                .tools(List.of(
                        ToolEntryDto.builder()
                                .toolId("cursor")
                                .plan("pro")
                                .monthlySpend(new BigDecimal("20"))
                                .seats(1)
                                .build()
                ))
                .teamSize(1)
                .primaryUseCase("coding")
                .build();

        mockMvc.perform(post("/api/audit/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("GET /api/audit/{publicId} returns 404 for unknown audit ID")
    void getAudit_unknownId_returns404() throws Exception {
        when(auditService.getAudit("nonexistent123"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit not found"));

        mockMvc.perform(get("/api/audit/nonexistent123")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
