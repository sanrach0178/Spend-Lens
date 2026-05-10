package com.credex.spendlens.service;

import com.credex.spendlens.entity.Audit;
import com.credex.spendlens.entity.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final String apiKey;
    private final String frontendUrl;
    private final RestTemplate restTemplate;

    public EmailService(
            @Value("${resend.api.key}") String apiKey,
            @Value("${frontend.url}") String frontendUrl,
            RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.frontendUrl = frontendUrl;
        this.restTemplate = restTemplate;
    }

    @Async
    public void sendAuditConfirmation(Lead lead, Audit audit) {
        try {
            String auditUrl = frontendUrl + "/audit/" + audit.getPublicId();
            
            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<h1>Your SpendLens Audit Results</h1>");
            htmlContent.append("<p>We found potential savings of $")
                    .append(audit.getTotalMonthlySavings())
                    .append("/mo.</p>");
            
            htmlContent.append("<p><a href=\"").append(auditUrl).append("\">Click here to view your full audit report</a></p>");

            if (Boolean.TRUE.equals(lead.getIsHighSavings())) {
                htmlContent.append("<h2>Book a Credex Consultation</h2>");
                htmlContent.append("<p>You have high potential savings! Book a consultation with us to help you optimize your stack.</p>");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                    "from", "SpendLens <onboarding@resend.dev>",
                    "to", lead.getEmail(),
                    "subject", "Your SpendLens Audit Results",
                    "html", htmlContent.toString()
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject("https://api.resend.com/emails", entity, String.class);
            log.info("Resend API Response: {}", response);
            log.info("Successfully sent audit confirmation email to {}", lead.getEmail());
            
        } catch (Exception e) {
            log.error("Failed to send email to {}", lead.getEmail(), e);
        }
    }
}
