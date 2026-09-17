package com.example.demo.repository;

import com.example.demo.entity.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequisitionRepository extends JpaRepository<Requisition, Integer> {
}