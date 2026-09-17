package com.example.demo.repository;

import com.example.demo.entity.Requisition;
import com.example.demo.entity.RequisitionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnalyticsRepository extends JpaRepository<Requisition, Integer> {

    // Spend by Department
    @Query("""
        SELECT r.department.departmentName,
               SUM(r.quantity * r.product.pricePerProduct)
        FROM Requisition r
        WHERE r.status = :status
        GROUP BY r.department.departmentName
        ORDER BY r.department.departmentName
    """)
    List<Object[]> getSpendByDepartment(RequisitionStatus status);


    // Spend by Category
    @Query("""
        SELECT r.product.category.categoryName,
               SUM(r.quantity * r.product.pricePerProduct)
        FROM Requisition r
        WHERE r.status = :status
        GROUP BY r.product.category.categoryName
        ORDER BY r.product.category.categoryName
    """)
    List<Object[]> getSpendByCategory(RequisitionStatus status);


    // Total Requisitions
    @Query("""
        SELECT COUNT(r)
        FROM Requisition r
    """)
    Long getTotalRequisitions();


    // Approved Requisitions
    @Query("""
        SELECT COUNT(r)
        FROM Requisition r
        WHERE r.status = 'APPROVED'
    """)
    Long getApprovedRequisitions();


    // Rejected Requisitions
    @Query("""
        SELECT COUNT(r)
        FROM Requisition r
        WHERE r.status = 'REJECTED'
    """)
    Long getRejectedRequisitions();


    // Total Spend
    @Query("""
        SELECT COALESCE(
            SUM(r.quantity * r.product.pricePerProduct), 0
        )
        FROM Requisition r
        WHERE r.status = 'APPROVED'
    """)
    Double getTotalSpend();
}