package com.credex.spendlens.repository;

import com.credex.spendlens.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<Audit, UUID> {
    Optional<Audit> findByPublicId(String publicId);
}
