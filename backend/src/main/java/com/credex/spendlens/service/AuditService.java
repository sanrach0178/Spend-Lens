package com.credex.spendlens.service;

import com.credex.spendlens.dto.AuditRequest;
import com.credex.spendlens.dto.AuditResponse;
import com.credex.spendlens.entity.Audit;
import com.credex.spendlens.repository.AuditRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class AuditService {

    private final AuditRepository auditRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public AuditService(AuditRepository auditRepository, GeminiService geminiService, ObjectMapper objectMapper) {
        this.auditRepository = auditRepository;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public AuditResponse createAudit(AuditRequest request, String ipAddress) {
        String ipHash = hashIp(ipAddress);
        Bucket bucket = resolveBucket(ipHash);

        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");
        }

        try {
            System.out.println("DEBUG: Starting audit creation for " + ipHash);
            AuditResponse result = request.getCalculatedResult();
            if (result == null) {
                System.err.println("DEBUG: Calculated result is null!");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Calculated result is required");
            }
            
            System.out.println("DEBUG: Generating AI summary...");
            String summary = geminiService.generateSummary(request, result);
            result.setSummary(summary);
            System.out.println("DEBUG: AI summary generated: " + (summary != null ? "success" : "failed"));
            
            String publicId = generatePublicId();
            result.setAuditId(publicId);

            Audit audit = Audit.builder()
                    .publicId(publicId)
                    .toolsJson(objectMapper.writeValueAsString(request.getTools()))
                    .auditResultJson(objectMapper.writeValueAsString(result))
                    .totalMonthlySavings(result.getTotalMonthlySavings())
                    .totalAnnualSavings(result.getTotalAnnualSavings())
                    .teamSize(request.getTeamSize())
                    .primaryUseCase(request.getPrimaryUseCase())
                    .ipHash(ipHash)
                    .build();

            System.out.println("DEBUG: Saving audit to repository...");
            auditRepository.save(audit);
            System.out.println("DEBUG: Audit saved with ID: " + publicId);
            
            return result;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize json", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    public AuditResponse getAudit(String publicId) {
        Audit audit = auditRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit not found"));

        try {
            return objectMapper.readValue(audit.getAuditResultJson(), AuditResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize audit result", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    private String hashIp(String ipAddress) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not found", e);
            return ipAddress; // Fallback
        }
    }

    private Bucket resolveBucket(String ipHash) {
        return buckets.computeIfAbsent(ipHash, k -> {
            Refill refill = Refill.intervally(10, Duration.ofHours(1));
            Bandwidth limit = Bandwidth.classic(10, refill);
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        });
    }

    private String generatePublicId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
