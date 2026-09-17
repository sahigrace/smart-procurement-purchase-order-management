package com.example.demo.service;

import com.example.demo.entity.PurchaseOrder;
import com.example.demo.entity.PurchaseOrderStatus;
import com.example.demo.entity.RequisitionStatus;
import com.example.demo.entity.Supplier;
import com.example.demo.repository.AnalyticsRepository;
import com.example.demo.repository.PurchaseOrderRepository;
import com.example.demo.repository.SupplierRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExcelReportService {

    private final AnalyticsRepository analyticsRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public ExcelReportService(
            AnalyticsRepository analyticsRepository,
            SupplierRepository supplierRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.analyticsRepository = analyticsRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public byte[] generateExcelReport() {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // ==========================================
            // SHEET 1 - DASHBOARD
            // ==========================================

            Sheet dashboardSheet = workbook.createSheet("Dashboard");

            Row titleRow = dashboardSheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Smart Procurement System");

            Row subtitleRow = dashboardSheet.createRow(1);
            Cell subtitleCell = subtitleRow.createCell(0);
            subtitleCell.setCellValue("Procurement Analytics Report");

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

            long totalPurchaseOrders = purchaseOrders.size();

            long closedPurchaseOrders =
                    purchaseOrders.stream()
                            .filter(po ->
                                    po.getStatus() ==
                                            PurchaseOrderStatus.CLOSED)
                            .count();

            Row headerRow = dashboardSheet.createRow(3);
            headerRow.createCell(0).setCellValue("KPI");
            headerRow.createCell(1).setCellValue("Value");

            Row row4 = dashboardSheet.createRow(4);
            row4.createCell(0).setCellValue("Total Requisitions");
            row4.createCell(1).setCellValue(totalRequisitions);

            Row row5 = dashboardSheet.createRow(5);
            row5.createCell(0).setCellValue("Approved Requisitions");
            row5.createCell(1).setCellValue(approvedRequisitions);

            Row row6 = dashboardSheet.createRow(6);
            row6.createCell(0).setCellValue("Rejected Requisitions");
            row6.createCell(1).setCellValue(rejectedRequisitions);

            Row row7 = dashboardSheet.createRow(7);
            row7.createCell(0).setCellValue("Total Purchase Orders");
            row7.createCell(1).setCellValue(totalPurchaseOrders);

            Row row8 = dashboardSheet.createRow(8);
            row8.createCell(0).setCellValue("Closed Purchase Orders");
            row8.createCell(1).setCellValue(closedPurchaseOrders);

            Row row9 = dashboardSheet.createRow(9);
            row9.createCell(0).setCellValue("Total Spend");
            row9.createCell(1).setCellValue(totalSpend);

            // ==========================================
            // SHEET 2 - SPEND BY DEPARTMENT
            // ==========================================

            Sheet departmentSheet =
                    workbook.createSheet("Spend by Department");

            Row departmentHeader =
                    departmentSheet.createRow(0);

            departmentHeader.createCell(0)
                    .setCellValue("Department");

            departmentHeader.createCell(1)
                    .setCellValue("Total Spend");

            List<Object[]> departmentResults =
                    analyticsRepository.getSpendByDepartment(
                            RequisitionStatus.APPROVED);

            int departmentRowNumber = 1;

            for (Object[] row : departmentResults) {

                Row excelRow =
                        departmentSheet.createRow(departmentRowNumber++);

                excelRow.createCell(0)
                        .setCellValue(String.valueOf(row[0]));

                excelRow.createCell(1)
                        .setCellValue(
                                Double.parseDouble(
                                        String.valueOf(row[1])));
            }

            // ==========================================
            // SHEET 3 - SPEND BY CATEGORY
            // ==========================================

            Sheet categorySheet =
                    workbook.createSheet("Spend by Category");

            Row categoryHeader =
                    categorySheet.createRow(0);

            categoryHeader.createCell(0)
                    .setCellValue("Category");

            categoryHeader.createCell(1)
                    .setCellValue("Total Spend");

            List<Object[]> categoryResults =
                    analyticsRepository.getSpendByCategory(
                            RequisitionStatus.APPROVED);

            int categoryRowNumber = 1;

            for (Object[] row : categoryResults) {

                Row excelRow =
                        categorySheet.createRow(categoryRowNumber++);

                excelRow.createCell(0)
                        .setCellValue(String.valueOf(row[0]));

                excelRow.createCell(1)
                        .setCellValue(
                                Double.parseDouble(
                                        String.valueOf(row[1])));
            }

            // ==========================================
            // SHEET 4 - SUPPLIER RATINGS
            // ==========================================

            Sheet supplierSheet =
                    workbook.createSheet("Supplier Ratings");

            Row supplierHeader =
                    supplierSheet.createRow(0);

            supplierHeader.createCell(0)
                    .setCellValue("Supplier ID");

            supplierHeader.createCell(1)
                    .setCellValue("Supplier Name");

            supplierHeader.createCell(2)
                    .setCellValue("Rating");

            List<Supplier> suppliers =
                    supplierRepository.findAll();

            int supplierRowNumber = 1;

            for (Supplier supplier : suppliers) {

                Row excelRow =
                        supplierSheet.createRow(supplierRowNumber++);

                excelRow.createCell(0)
                        .setCellValue(supplier.getSupplierId());

                excelRow.createCell(1)
                        .setCellValue(supplier.getName());

                excelRow.createCell(2)
                        .setCellValue(supplier.getRating());
            }

            // ==========================================
            // SHEET 5 - PURCHASE ORDERS
            // ==========================================

            Sheet purchaseOrderSheet =
                    workbook.createSheet("Purchase Orders");

            Row poHeader =
                    purchaseOrderSheet.createRow(0);

            poHeader.createCell(0)
                    .setCellValue("PO ID");

            poHeader.createCell(1)
                    .setCellValue("Requisition ID");

            poHeader.createCell(2)
                    .setCellValue("Supplier");

            poHeader.createCell(3)
                    .setCellValue("Status");

            poHeader.createCell(4)
                    .setCellValue("Shipment Status");

            poHeader.createCell(5)
                    .setCellValue("PO Date");

            int poRowNumber = 1;

            for (PurchaseOrder po : purchaseOrders) {

                Row excelRow =
                        purchaseOrderSheet.createRow(poRowNumber++);

                excelRow.createCell(0)
                        .setCellValue(po.getPoId());

                if (po.getRequisition() != null) {
                    excelRow.createCell(1)
                            .setCellValue(
                                    po.getRequisition()
                                            .getRequisitionId());
                }

                if (po.getSupplier() != null) {
                    excelRow.createCell(2)
                            .setCellValue(
                                    po.getSupplier().getName());
                }

                if (po.getStatus() != null) {
                    excelRow.createCell(3)
                            .setCellValue(
                                    po.getStatus().name());
                }

                if (po.getShipmentStatus() != null) {
                    excelRow.createCell(4)
                            .setCellValue(
                                    po.getShipmentStatus());
                }

                if (po.getPoDate() != null) {
                    excelRow.createCell(5)
                            .setCellValue(
                                    po.getPoDate().toString());
                }
            }

            // ==========================================
            // AUTO SIZE COLUMNS
            // ==========================================

            autoSizeColumns(dashboardSheet, 2);
            autoSizeColumns(departmentSheet, 2);
            autoSizeColumns(categorySheet, 2);
            autoSizeColumns(supplierSheet, 3);
            autoSizeColumns(purchaseOrderSheet, 6);

            // ==========================================
            // WRITE EXCEL FILE
            // ==========================================

            workbook.write(outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate Excel report",
                    e);
        }
    }

    private void autoSizeColumns(
            Sheet sheet,
            int numberOfColumns) {

        for (int i = 0; i < numberOfColumns; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}