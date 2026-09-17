package com.example.demo.controller;

import com.example.demo.entity.PurchaseOrder;
import com.example.demo.service.PurchaseOrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    // Get all Purchase Orders
    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return service.getAllPurchaseOrders();
    }

    // Get Purchase Order by ID
    @GetMapping("/{id}")
    public PurchaseOrder getPurchaseOrderById(
            @PathVariable Integer id) {
        return service.getPurchaseOrderById(id);
    }

    // Generate Purchase Order
    @PostMapping("/generate")
    public PurchaseOrder generatePurchaseOrder(
            @RequestParam Integer requisitionId,
            @RequestParam Integer supplierId) {

        return service.generatePurchaseOrder(
                requisitionId,
                supplierId);
    }

    // Send Purchase Order to Supplier
    @PutMapping("/{id}/send")
    public PurchaseOrder sendToSupplier(
            @PathVariable Integer id) {

        return service.sendToSupplier(id);
    }

    // Track Shipment
    @PutMapping("/{id}/shipment")
    public PurchaseOrder trackShipment(
            @PathVariable Integer id,
            @RequestParam String shipmentStatus) {

        return service.trackShipment(
                id,
                shipmentStatus);
    }

    // Close Purchase Order
    @PutMapping("/{id}/close")
    public PurchaseOrder closePurchaseOrder(
            @PathVariable Integer id) {

        return service.closePurchaseOrder(id);
    }
}