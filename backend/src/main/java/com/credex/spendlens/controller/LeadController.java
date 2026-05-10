package com.credex.spendlens.controller;

import com.credex.spendlens.dto.LeadCaptureRequest;
import com.credex.spendlens.service.LeadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/capture")
    public ResponseEntity<Void> captureLead(@RequestBody LeadCaptureRequest request) {
        leadService.captureLead(request);
        return ResponseEntity.ok().build();
    }
}
