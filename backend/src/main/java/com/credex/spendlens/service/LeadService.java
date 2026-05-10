package com.credex.spendlens.service;

import com.credex.spendlens.dto.LeadCaptureRequest;
import com.credex.spendlens.entity.Audit;
import com.credex.spendlens.entity.Lead;
import com.credex.spendlens.repository.AuditRepository;
import com.credex.spendlens.repository.LeadRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@Service
@Slf4j
public class LeadService {

    private final LeadRepository leadRepository;
    private final AuditRepository auditRepository;
    private final EmailService emailService;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public LeadService(LeadRepository leadRepository, AuditRepository auditRepository, EmailService emailService) {
        this.leadRepository = leadRepository;
        this.auditRepository = auditRepository;
        this.emailService = emailService;
    }

    public void captureLead(LeadCaptureRequest request) {
        if (request.getWebsite() != null && !request.getWebsite().isEmpty()) {
            log.info("Honeypot filled, ignoring request");
            return;
        }

        if (request.getEmail() == null || !EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        Audit audit = auditRepository.findByPublicId(request.getAuditId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit not found"));

        if (leadRepository.findByAuditIdAndEmail(audit.getId(), request.getEmail()).isPresent()) {
            log.info("Lead already captured for audit {} and email {}", request.getAuditId(), request.getEmail());
            return;
        }

        Lead lead = Lead.builder()
                .auditId(audit.getId())
                .email(request.getEmail())
                .companyName(request.getCompanyName())
                .role(request.getRole())
                .teamSize(request.getTeamSize())
                .isHighSavings(audit.getTotalMonthlySavings().doubleValue() > 1000) // Example threshold
                .build();

        leadRepository.save(lead);

        sendConfirmationEmail(lead, audit);
    }

    @Async
    public void sendConfirmationEmail(Lead lead, Audit audit) {
        emailService.sendAuditConfirmation(lead, audit);
        lead.setEmailSent(true);
        leadRepository.save(lead);
    }
}
