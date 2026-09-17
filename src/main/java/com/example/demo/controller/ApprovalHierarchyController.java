package com.example.demo.controller;

import com.example.demo.entity.ApprovalHierarchy;
import com.example.demo.service.ApprovalHierarchyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approval-hierarchy")
public class ApprovalHierarchyController {

    private final ApprovalHierarchyService service;

    public ApprovalHierarchyController(ApprovalHierarchyService service) {
        this.service = service;
    }

    // Get all approval hierarchy records
    @GetMapping
    public List<ApprovalHierarchy> getAllApprovalHierarchy() {
        return service.getAllApprovalHierarchy();
    }

    // Save approval hierarchy
    @PostMapping
    public ApprovalHierarchy saveApprovalHierarchy(
            @RequestBody ApprovalHierarchy approvalHierarchy) {
        return service.saveApprovalHierarchy(approvalHierarchy);
    }

    // Get approval levels for a department
    @GetMapping("/department/{departmentId}")
    public List<ApprovalHierarchy> getApprovalLevels(
            @PathVariable Integer departmentId) {
        return service.getApprovalLevels(departmentId);
    }
}