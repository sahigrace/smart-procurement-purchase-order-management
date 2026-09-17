package com.example.demo.controller;

import com.example.demo.entity.Requisition;
import com.example.demo.service.RequisitionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requisitions")
public class RequisitionController {

    private final RequisitionService service;

    public RequisitionController(RequisitionService service) {
        this.service = service;
    }

    // Get all requisitions
    @GetMapping
    public List<Requisition> getAllRequisitions() {
        return service.getAllRequisitions();
    }

    // Get requisition by ID
    @GetMapping("/{id}")
    public Requisition getRequisitionById(@PathVariable Integer id) {
        return service.getRequisitionById(id);
    }

    // Raise requisition
    @PostMapping
    public Requisition createRequisition(@RequestBody Requisition requisition) {
        return service.createRequisition(requisition);
    }

    // Submit requisition
    @PutMapping("/{id}/submit")
    public Requisition submitRequisition(@PathVariable Integer id) {
        return service.submitRequisition(id);
    }

    // Approve requisition
    @PutMapping("/{id}/approve/{userId}")
    public Requisition approveRequisition(
            @PathVariable Integer id,
            @PathVariable Integer userId) {

        return service.approveRequisition(id, userId);
    }

    // Reject requisition
    @PutMapping("/{id}/reject")
    public Requisition rejectRequisition(@PathVariable Integer id) {
        return service.rejectRequisition(id);
    }
}