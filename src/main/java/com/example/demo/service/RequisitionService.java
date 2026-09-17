package com.example.demo.service;

import com.example.demo.entity.Requisition;
import com.example.demo.entity.RequisitionStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.RequisitionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RequisitionService {

    private final RequisitionRepository repository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public RequisitionService(
            RequisitionRepository repository,
            EmailService emailService,
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.repository = repository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // ==========================================
    // GET ALL REQUISITIONS
    // ==========================================

    public List<Requisition> getAllRequisitions() {
        return repository.findAll();
    }

    // ==========================================
    // GET REQUISITION BY ID
    // ==========================================

    public Requisition getRequisitionById(Integer requisitionId) {

        return repository.findById(requisitionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Requisition not found"
                        )
                );
    }

    // ==========================================
    // CREATE / RAISE REQUISITION
    // ==========================================

    public Requisition createRequisition(
            Requisition requisition) {

        requisition.setStatus(
                RequisitionStatus.DRAFT
        );

        requisition.setCreatedDate(
                LocalDateTime.now()
        );

        requisition.setUpdatedDate(
                LocalDateTime.now()
        );

        Requisition savedRequisition =
                repository.save(requisition);

        String performedBy = "SYSTEM";

        if (savedRequisition.getUser() != null &&
                savedRequisition.getUser().getUserName() != null) {

            performedBy =
                    savedRequisition.getUser().getUserName();
        }

        auditLogService.logAction(
                "REQUISITION_CREATED",
                "REQUISITION",
                savedRequisition.getRequisitionId(),
                performedBy,
                "Requisition created with status DRAFT"
        );

        return savedRequisition;
    }

    // ==========================================
    // SUBMIT REQUISITION
    // ==========================================

    public Requisition submitRequisition(
            Integer requisitionId) {

        Requisition requisition =
                repository.findById(requisitionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requisition not found"
                                )
                        );

        requisition.setStatus(
                RequisitionStatus.PENDING_LEVEL_1
        );

        requisition.setUpdatedDate(
                LocalDateTime.now()
        );

        Requisition savedRequisition =
                repository.save(requisition);

        String performedBy = "SYSTEM";

        if (savedRequisition.getUser() != null &&
                savedRequisition.getUser().getUserName() != null) {

            performedBy =
                    savedRequisition.getUser().getUserName();
        }

        auditLogService.logAction(
                "REQUISITION_SUBMITTED",
                "REQUISITION",
                savedRequisition.getRequisitionId(),
                performedBy,
                "Requisition submitted for Level 1 approval"
        );

        return savedRequisition;
    }

    // ==========================================
    // APPROVE REQUISITION
    // ==========================================

    public Requisition approveRequisition(
            Integer requisitionId,
            Integer userId) {

        Requisition requisition =
                repository.findById(requisitionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requisition not found"
                                )
                        );

        User approvingUser =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Approving user not found"
                                )
                        );

        // ==========================================
        // GET CURRENT STATUS
        // ==========================================

        RequisitionStatus currentStatus =
                requisition.getStatus();

        // ==========================================
        // LEVEL 1 - MANAGER APPROVAL
        // ==========================================

        if (currentStatus ==
                RequisitionStatus.PENDING_LEVEL_1) {

            if (!"MANAGER".equalsIgnoreCase(
                    approvingUser.getRole())) {

                throw new RuntimeException(
                        "Only a MANAGER can approve Level 1"
                );
            }

            if (requisition.getDepartment() == null ||
                    approvingUser.getDepartment() == null) {

                throw new RuntimeException(
                        "Department information is missing"
                );
            }

            if (!requisition.getDepartment()
                    .getDepartmentId()
                    .equals(
                            approvingUser.getDepartment()
                                    .getDepartmentId()
                    )) {

                throw new RuntimeException(
                        "Manager must belong to the requisition department"
                );
            }

            String managerName =
                    requisition.getDepartment()
                            .getManagerOfDepartment();

            if (managerName == null ||
                    !managerName.equalsIgnoreCase(
                            approvingUser.getUserName()
                    )) {

                throw new RuntimeException(
                        "Only the department manager can approve Level 1"
                );
            }

            requisition.setStatus(
                    RequisitionStatus.PENDING_LEVEL_2
            );
        }

        // ==========================================
        // LEVEL 2 - FINANCE APPROVAL
        // ==========================================

        else if (currentStatus ==
                RequisitionStatus.PENDING_LEVEL_2) {

            if (!"FINANCE".equalsIgnoreCase(
                    approvingUser.getRole())) {

                throw new RuntimeException(
                        "Only FINANCE can approve Level 2"
                );
            }

            requisition.setStatus(
                    RequisitionStatus.PENDING_LEVEL_3
            );
        }

        // ==========================================
        // LEVEL 3 - PROCUREMENT HEAD APPROVAL
        // ==========================================

        else if (currentStatus ==
                RequisitionStatus.PENDING_LEVEL_3) {

            if (!"PROCUREMENT_HEAD".equalsIgnoreCase(
                    approvingUser.getRole())) {

                throw new RuntimeException(
                        "Only PROCUREMENT_HEAD can approve Level 3"
                );
            }

            requisition.setStatus(
                    RequisitionStatus.APPROVED
            );
        }

        // ==========================================
        // INVALID STATUS
        // ==========================================

        else {

            throw new RuntimeException(
                    "Requisition is not waiting for approval"
            );
        }

        requisition.setUpdatedDate(
                LocalDateTime.now()
        );

        Requisition savedRequisition =
                repository.save(requisition);

        // ==========================================
        // AUDIT APPROVAL
        // ==========================================

        auditLogService.logAction(
                "REQUISITION_APPROVED",
                "REQUISITION",
                savedRequisition.getRequisitionId(),
                approvingUser.getUserName(),
                "Requisition moved from "
                        + currentStatus
                        + " to "
                        + savedRequisition.getStatus()
        );

        // ==========================================
        // FINAL APPROVAL EMAIL
        // ==========================================

        if (savedRequisition.getStatus() ==
                RequisitionStatus.APPROVED) {

            emailService.sendRequisitionStatusEmail(
                    savedRequisition.getUser().getEmail(),
                    savedRequisition.getRequisitionId(),
                    savedRequisition.getStatus().name()
            );
        }

        return savedRequisition;
    }

    // ==========================================
    // REJECT REQUISITION
    // ==========================================

    public Requisition rejectRequisition(
            Integer requisitionId) {

        Requisition requisition =
                repository.findById(requisitionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requisition not found"
                                )
                        );

        requisition.setStatus(
                RequisitionStatus.REJECTED
        );

        requisition.setUpdatedDate(
                LocalDateTime.now()
        );

        Requisition savedRequisition =
                repository.save(requisition);

        String performedBy = "SYSTEM";

        if (savedRequisition.getUser() != null &&
                savedRequisition.getUser().getUserName() != null) {

            performedBy =
                    savedRequisition.getUser().getUserName();
        }

        // ==========================================
        // AUDIT REJECTION
        // ==========================================

        auditLogService.logAction(
                "REQUISITION_REJECTED",
                "REQUISITION",
                savedRequisition.getRequisitionId(),
                performedBy,
                "Requisition rejected"
        );

        // ==========================================
        // REJECTION EMAIL
        // ==========================================

        emailService.sendRequisitionStatusEmail(
                savedRequisition.getUser().getEmail(),
                savedRequisition.getRequisitionId(),
                savedRequisition.getStatus().name()
        );

        return savedRequisition;
    }
}