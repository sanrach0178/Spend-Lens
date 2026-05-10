package com.credex.spendlens.service;

import com.credex.spendlens.dto.AuditRequest;
import com.credex.spendlens.dto.AuditResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(@Value("${gemini.api.key}") String apiKey, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String generateSummary(AuditRequest request, AuditResponse result) {
        try {
            String auditJson = objectMapper.writeValueAsString(result);
            
            String prompt = String.format(
                    "You are a concise financial advisor for startups. Given this AI tool spend audit, write a 100-word personalized summary. Be specific about the dollar amounts. Lead with the biggest win. End with one actionable next step. Tone: direct, not salesy. Data: %s",
                    auditJson
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> requestBody = Map.of(
                    "model", "claude-3-haiku-20240307",
                    "max_tokens", 300,
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            Map<String, Object> response = restTemplate.postForObject(
                    "https://api.anthropic.com/v1/messages",
                    entity,
                    Map.class
            );

            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
                if (!contentList.isEmpty()) {
                    return (String) contentList.get(0).get("text");
                }
            }
            
            return getFallbackSummary(result);
        } catch (Exception e) {
            log.error("Failed to generate summary from AI. Using fallback.", e);
            return getFallbackSummary(result);
        }
    }

    private String getFallbackSummary(AuditResponse result) {
        int numTools = result.getTools() != null ? result.getTools().size() : 0;
        BigDecimal totalSavings = result.getTotalMonthlySavings() != null ? result.getTotalMonthlySavings() : BigDecimal.ZERO;
        
        String topTool = "your stack";
        if (result.getTools() != null && !result.getTools().isEmpty()) {
            topTool = result.getTools().get(0).getToolId();
        }

        return String.format(
                "Based on your audit, you're spending across %d AI tools. Our analysis found $%s/mo in potential savings. Your biggest opportunity is %s. Review the recommendations below and prioritize the highest-impact changes first.",
                numTools, totalSavings, topTool
        );
    }
}
