package com.example.demo.service;

import com.example.demo.entity.ApprovalHierarchy;
import com.example.demo.repository.ApprovalHierarchyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApprovalHierarchyService {

    private final ApprovalHierarchyRepository repository;

    public ApprovalHierarchyService(ApprovalHierarchyRepository repository) {
        this.repository = repository;
    }

    // Get all approval hierarchy records
    public List<ApprovalHierarchy> getAllApprovalHierarchy() {
        return repository.findAll();
    }

    // Save approval hierarchy
    public ApprovalHierarchy saveApprovalHierarchy(ApprovalHierarchy approvalHierarchy) {
        return repository.save(approvalHierarchy);
    }

    // Get approval levels for a department
    public List<ApprovalHierarchy> getApprovalLevels(Integer departmentId) {
        return repository.findByDepartmentDepartmentIdOrderByLevelAsc(departmentId);
    }
}