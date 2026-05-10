package com.credex.spendlens.repository;

import com.credex.spendlens.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Optional<Lead> findByAuditIdAndEmail(UUID auditId, String email);
}
