package com.credex.spendlens.controller;

import com.credex.spendlens.dto.AuditRequest;
import com.credex.spendlens.dto.AuditResponse;
import com.credex.spendlens.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping("/run")
    public ResponseEntity<AuditResponse> createAudit(@RequestBody AuditRequest request, HttpServletRequest httpRequest) {
        String ipAddress = getClientIpAddress(httpRequest);
        System.out.println("DEBUG: Received audit request from IP: " + ipAddress);
        System.out.println("DEBUG: Request data: " + request);
        try {
            AuditResponse response = auditService.createAudit(request, ipAddress);
            System.out.println("DEBUG: Audit created successfully: " + response.getAuditId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("DEBUG: Error creating audit: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<AuditResponse> getAudit(@PathVariable String publicId) {
        AuditResponse response = auditService.getAudit(publicId);
        return ResponseEntity.ok(response);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
