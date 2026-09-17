package com.example.demo.service;

import com.example.demo.entity.PurchaseOrder;
import com.example.demo.entity.PurchaseOrderStatus;
import com.example.demo.entity.Requisition;
import com.example.demo.entity.RequisitionStatus;
import com.example.demo.entity.Supplier;
import com.example.demo.repository.PurchaseOrderRepository;
import com.example.demo.repository.RequisitionRepository;
import com.example.demo.repository.SupplierRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RequisitionRepository requisitionRepository;
    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            RequisitionRepository requisitionRepository,
            SupplierRepository supplierRepository,
            AuditLogService auditLogService) {

        this.purchaseOrderRepository = purchaseOrderRepository;
        this.requisitionRepository = requisitionRepository;
        this.supplierRepository = supplierRepository;
        this.auditLogService = auditLogService;
    }

    private String getCurrentUsername() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication != null &&
                authentication.isAuthenticated()) {

            return authentication.getName();
        }

        return "SYSTEM";
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getPurchaseOrderById(Integer poId) {

        return purchaseOrderRepository.findById(poId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Purchase Order not found"));
    }

    public PurchaseOrder generatePurchaseOrder(
            Integer requisitionId,
            Integer supplierId) {

        Requisition requisition =
                requisitionRepository
                        .findById(requisitionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Requisition not found"));

        if (requisition.getStatus() !=
                RequisitionStatus.APPROVED) {

            throw new RuntimeException(
                    "Purchase Order can only be generated for an approved requisition");
        }

        Supplier supplier =
                supplierRepository
                        .findById(supplierId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Supplier not found"));

        PurchaseOrder purchaseOrder =
                new PurchaseOrder();

        purchaseOrder.setRequisition(requisition);
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setStatus(
                PurchaseOrderStatus.GENERATED);
        purchaseOrder.setShipmentStatus("NOT_STARTED");
        purchaseOrder.setPoDate(LocalDateTime.now());
        purchaseOrder.setCreatedDate(LocalDateTime.now());
        purchaseOrder.setUpdatedDate(LocalDateTime.now());

        PurchaseOrder savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.logAction(
                "PURCHASE_ORDER_CREATED",
                "PURCHASE_ORDER",
                savedPurchaseOrder.getPoId(),
                getCurrentUsername(),
                "Purchase Order generated from requisition "
                        + requisitionId
        );

        return savedPurchaseOrder;
    }

    public PurchaseOrder sendToSupplier(Integer poId) {

        PurchaseOrder purchaseOrder =
                getPurchaseOrderById(poId);

        if (purchaseOrder.getStatus() !=
                PurchaseOrderStatus.GENERATED) {

            throw new RuntimeException(
                    "Only a generated Purchase Order can be sent to supplier");
        }

        purchaseOrder.setStatus(
                PurchaseOrderStatus.SENT_TO_SUPPLIER);

        purchaseOrder.setShipmentStatus("NOT_STARTED");
        purchaseOrder.setUpdatedDate(LocalDateTime.now());

        PurchaseOrder savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.logAction(
                "PURCHASE_ORDER_SENT",
                "PURCHASE_ORDER",
                savedPurchaseOrder.getPoId(),
                getCurrentUsername(),
                "Purchase Order sent to supplier"
        );

        return savedPurchaseOrder;
    }

    public PurchaseOrder trackShipment(
            Integer poId,
            String shipmentStatus) {

        PurchaseOrder purchaseOrder =
                getPurchaseOrderById(poId);

        if (purchaseOrder.getStatus() !=
                PurchaseOrderStatus.SENT_TO_SUPPLIER &&
                purchaseOrder.getStatus() !=
                        PurchaseOrderStatus.SHIPMENT_IN_PROGRESS) {

            throw new RuntimeException(
                    "Purchase Order is not ready for shipment tracking");
        }

        purchaseOrder.setShipmentStatus(shipmentStatus);

        if ("IN_PROGRESS".equalsIgnoreCase(
                shipmentStatus)) {

            purchaseOrder.setStatus(
                    PurchaseOrderStatus.SHIPMENT_IN_PROGRESS);

        } else if ("DELIVERED".equalsIgnoreCase(
                shipmentStatus)) {

            purchaseOrder.setStatus(
                    PurchaseOrderStatus.DELIVERED);
        }

        purchaseOrder.setUpdatedDate(LocalDateTime.now());

        PurchaseOrder savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.logAction(
                "SHIPMENT_UPDATED",
                "PURCHASE_ORDER",
                savedPurchaseOrder.getPoId(),
                getCurrentUsername(),
                "Shipment status updated to "
                        + shipmentStatus
        );

        return savedPurchaseOrder;
    }

    public PurchaseOrder closePurchaseOrder(Integer poId) {

        PurchaseOrder purchaseOrder =
                getPurchaseOrderById(poId);

        if (purchaseOrder.getStatus() !=
                PurchaseOrderStatus.DELIVERED) {

            throw new RuntimeException(
                    "Purchase Order can only be closed after delivery");
        }

        purchaseOrder.setStatus(
                PurchaseOrderStatus.CLOSED);

        purchaseOrder.setUpdatedDate(LocalDateTime.now());

        PurchaseOrder savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.logAction(
                "PURCHASE_ORDER_CLOSED",
                "PURCHASE_ORDER",
                savedPurchaseOrder.getPoId(),
                getCurrentUsername(),
                "Purchase Order closed after delivery"
        );

        return savedPurchaseOrder;
    }
}