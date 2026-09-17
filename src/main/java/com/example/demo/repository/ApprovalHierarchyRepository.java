package com.example.demo.repository;

import com.example.demo.entity.ApprovalHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalHierarchyRepository extends JpaRepository<ApprovalHierarchy, Integer> {

    List<ApprovalHierarchy> findByDepartmentDepartmentIdOrderByLevelAsc(Integer departmentId);
}