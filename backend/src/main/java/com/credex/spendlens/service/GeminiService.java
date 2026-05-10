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

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

            // Gemini API request body format
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "maxOutputTokens", 300,
                            "temperature", 0.7
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = GEMINI_API_URL + "?key=" + apiKey;

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }

            return getFallbackSummary(result);
        } catch (Exception e) {
            log.error("Failed to generate summary from Gemini API. Using fallback.", e);
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
