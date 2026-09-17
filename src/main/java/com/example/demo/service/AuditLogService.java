package com.example.demo.service;

import com.example.demo.entity.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository) {

        this.auditLogRepository = auditLogRepository;
    }

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    public AuditLog logAction(
            String action,
            String entityType,
            Integer entityId,
            String performedBy,
            String details) {

        AuditLog auditLog = new AuditLog();

        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setPerformedBy(performedBy);
        auditLog.setDetails(details);
        auditLog.setCreatedDate(LocalDateTime.now());

        return auditLogRepository.save(auditLog);
    }

    // ==========================================
    // GET ALL AUDIT LOGS
    // ==========================================

    public List<AuditLog> getAllLogs() {

        return auditLogRepository
                .findAllByOrderByCreatedDateDesc();
    }
}