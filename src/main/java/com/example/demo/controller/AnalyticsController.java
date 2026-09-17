package com.example.demo.controller;

import com.example.demo.service.AnalyticsService;
import com.example.demo.service.ExcelReportService;
import com.example.demo.service.PdfReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final PdfReportService pdfReportService;
    private final ExcelReportService excelReportService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            PdfReportService pdfReportService,
            ExcelReportService excelReportService) {

        this.analyticsService = analyticsService;
        this.pdfReportService = pdfReportService;
        this.excelReportService = excelReportService;
    }

    // ==========================================
    // SPEND BY DEPARTMENT
    // ==========================================

    @GetMapping("/spend-by-department")
    public List<Map<String, Object>> getSpendByDepartment() {
        return analyticsService.getSpendByDepartment();
    }

    // ==========================================
    // SPEND BY CATEGORY
    // ==========================================

    @GetMapping("/spend-by-category")
    public List<Map<String, Object>> getSpendByCategory() {
        return analyticsService.getSpendByCategory();
    }

    // ==========================================
    // SUPPLIER RATINGS
    // ==========================================

    @GetMapping("/supplier-ratings")
    public List<Map<String, Object>> getSupplierRatings() {
        return analyticsService.getSupplierRatings();
    }

    // ==========================================
    // DASHBOARD KPIs
    // ==========================================

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardKPIs() {
        return analyticsService.getDashboardKPIs();
    }

    // ==========================================
    // PDF REPORT
    // ==========================================

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> generatePdfReport() {

        byte[] pdf =
                pdfReportService.generateProcurementReport();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=procurement-report.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // ==========================================
    // EXCEL REPORT
    // ==========================================

    @GetMapping("/report/excel")
    public ResponseEntity<byte[]> generateExcelReport() {

        byte[] excel =
                excelReportService.generateExcelReport();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=procurement-report.xlsx"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(excel);
    }
}