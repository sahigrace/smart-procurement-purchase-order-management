package com.example.demo.service;

import com.example.demo.entity.PurchaseOrder;
import com.example.demo.entity.PurchaseOrderStatus;
import com.example.demo.entity.RequisitionStatus;
import com.example.demo.repository.AnalyticsRepository;
import com.example.demo.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Table;
import com.lowagie.text.Cell;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfReportService {

    private final AnalyticsRepository analyticsRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public PdfReportService(
            AnalyticsRepository analyticsRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.analyticsRepository = analyticsRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public byte[] generateProcurementReport() {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document();

        try {

            PdfWriter.getInstance(
                    document,
                    outputStream);

            document.open();

            // Title
            Paragraph title =
                    new Paragraph("Smart Procurement System");

            document.add(title);

            document.add(
                    new Paragraph("Procurement Analytics Report"));

            document.add(
                    new Paragraph(" "));

            // Dashboard KPIs
            document.add(
                    new Paragraph("Dashboard KPIs"));

            Long totalRequisitions =
                    analyticsRepository.getTotalRequisitions();

            Long approvedRequisitions =
                    analyticsRepository.getApprovedRequisitions();

            Long rejectedRequisitions =
                    analyticsRepository.getRejectedRequisitions();

            Double totalSpend =
                    analyticsRepository.getTotalSpend();

            List<PurchaseOrder> purchaseOrders =
                    purchaseOrderRepository.findAll();

            long totalPurchaseOrders =
                    purchaseOrders.size();

            long closedPurchaseOrders =
                    purchaseOrders.stream()
                            .filter(po ->
                                    po.getStatus() ==
                                            PurchaseOrderStatus.CLOSED)
                            .count();

            document.add(
                    new Paragraph(
                            "Total Requisitions: "
                                    + totalRequisitions));

            document.add(
                    new Paragraph(
                            "Approved Requisitions: "
                                    + approvedRequisitions));

            document.add(
                    new Paragraph(
                            "Rejected Requisitions: "
                                    + rejectedRequisitions));

            document.add(
                    new Paragraph(
                            "Total Purchase Orders: "
                                    + totalPurchaseOrders));

            document.add(
                    new Paragraph(
                            "Closed Purchase Orders: "
                                    + closedPurchaseOrders));

            document.add(
                    new Paragraph(
                            "Total Spend: ₹"
                                    + totalSpend));

            document.add(
                    new Paragraph(" "));

            // Spend by Department
            document.add(
                    new Paragraph("Spend by Department"));

            List<Object[]> departmentResults =
                    analyticsRepository.getSpendByDepartment(
                            RequisitionStatus.APPROVED);

            Table departmentTable =
                    new Table(2);

            departmentTable.addCell(
                    new Cell("Department"));

            departmentTable.addCell(
                    new Cell("Total Spend"));

            for (Object[] row : departmentResults) {

                departmentTable.addCell(
                        new Cell(String.valueOf(row[0])));

                departmentTable.addCell(
                        new Cell(String.valueOf(row[1])));
            }

            document.add(departmentTable);

            document.add(
                    new Paragraph(" "));

            // Spend by Category
            document.add(
                    new Paragraph("Spend by Category"));

            List<Object[]> categoryResults =
                    analyticsRepository.getSpendByCategory(
                            RequisitionStatus.APPROVED);

            Table categoryTable =
                    new Table(2);

            categoryTable.addCell(
                    new Cell("Category"));

            categoryTable.addCell(
                    new Cell("Total Spend"));

            for (Object[] row : categoryResults) {

                categoryTable.addCell(
                        new Cell(String.valueOf(row[0])));

                categoryTable.addCell(
                        new Cell(String.valueOf(row[1])));
            }

            document.add(categoryTable);

            document.add(
                    new Paragraph(" "));

            document.add(
                    new Paragraph(
                            "Generated by Smart Procurement System"));

            document.close();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate PDF report",
                    e);
        }

        return outputStream.toByteArray();
    }
}