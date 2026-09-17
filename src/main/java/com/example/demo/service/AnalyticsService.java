package com.example.demo.service;

import com.example.demo.entity.PurchaseOrder;
import com.example.demo.entity.PurchaseOrderStatus;
import com.example.demo.entity.RequisitionStatus;
import com.example.demo.entity.Supplier;
import com.example.demo.repository.AnalyticsRepository;
import com.example.demo.repository.PurchaseOrderRepository;
import com.example.demo.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public AnalyticsService(
            AnalyticsRepository analyticsRepository,
            SupplierRepository supplierRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.analyticsRepository = analyticsRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // Spend by Department
    public List<Map<String, Object>> getSpendByDepartment() {

        List<Object[]> results =
                analyticsRepository.getSpendByDepartment(
                        RequisitionStatus.APPROVED);

        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {

            Map<String, Object> data = new HashMap<>();

            data.put("department", row[0]);
            data.put("totalSpend", row[1]);

            response.add(data);
        }

        return response;
    }

    // Spend by Category
    public List<Map<String, Object>> getSpendByCategory() {

        List<Object[]> results =
                analyticsRepository.getSpendByCategory(
                        RequisitionStatus.APPROVED);

        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {

            Map<String, Object> data = new HashMap<>();

            data.put("category", row[0]);
            data.put("totalSpend", row[1]);

            response.add(data);
        }

        return response;
    }

    // Supplier Rating
    public List<Map<String, Object>> getSupplierRatings() {

        List<Supplier> suppliers = supplierRepository.findAll();

        List<Map<String, Object>> response = new ArrayList<>();

        for (Supplier supplier : suppliers) {

            Map<String, Object> data = new HashMap<>();

            data.put("supplierId", supplier.getSupplierId());
            data.put("supplierName", supplier.getName());
            data.put("rating", supplier.getRating());

            response.add(data);
        }

        return response;
    }

    // Dashboard KPIs
    public Map<String, Object> getDashboardKPIs() {

        Map<String, Object> kpis = new HashMap<>();

        // Requisition KPIs
        Long totalRequisitions =
                analyticsRepository.getTotalRequisitions();

        Long approvedRequisitions =
                analyticsRepository.getApprovedRequisitions();

        Long rejectedRequisitions =
                analyticsRepository.getRejectedRequisitions();

        // Purchase Order KPIs
        List<PurchaseOrder> purchaseOrders =
                purchaseOrderRepository.findAll();

        long totalPurchaseOrders = purchaseOrders.size();

        long closedPurchaseOrders =
                purchaseOrders.stream()
                        .filter(po ->
                                po.getStatus() ==
                                        PurchaseOrderStatus.CLOSED)
                        .count();

        // Total Spend
        Double totalSpend =
                analyticsRepository.getTotalSpend();

        // Add values to response
        kpis.put("totalRequisitions", totalRequisitions);
        kpis.put("approvedRequisitions", approvedRequisitions);
        kpis.put("rejectedRequisitions", rejectedRequisitions);
        kpis.put("totalPurchaseOrders", totalPurchaseOrders);
        kpis.put("closedPurchaseOrders", closedPurchaseOrders);
        kpis.put("totalSpend", totalSpend);

        return kpis;
    }
}