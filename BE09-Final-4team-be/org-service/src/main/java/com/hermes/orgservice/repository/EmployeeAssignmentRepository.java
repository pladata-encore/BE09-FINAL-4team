package com.hermes.orgservice.repository;

import com.hermes.orgservice.entity.EmployeeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAssignmentRepository extends JpaRepository<EmployeeAssignment, Long> {

    List<EmployeeAssignment> findByEmployeeId(Long employeeId);
    
    List<EmployeeAssignment> findByOrganizationOrganizationId(Long organizationId);
    
    Optional<EmployeeAssignment> findByEmployeeIdAndOrganizationOrganizationId(Long employeeId, Long organizationId);
    
    List<EmployeeAssignment> findByEmployeeIdAndIsPrimaryTrue(Long employeeId);
    
    List<EmployeeAssignment> findByOrganizationOrganizationIdAndIsLeaderTrue(Long organizationId);
    
    @Query("SELECT ea FROM EmployeeAssignment ea WHERE ea.employeeId = :employeeId AND ea.isPrimary = true")
    List<EmployeeAssignment> findPrimaryAssignmentsByEmployeeId(@Param("employeeId") Long employeeId);
    
    @Query("SELECT ea FROM EmployeeAssignment ea WHERE ea.organization.organizationId = :organizationId AND ea.isLeader = true")
    List<EmployeeAssignment> findLeadersByOrganizationId(@Param("organizationId") Long organizationId);
    
    boolean existsByEmployeeIdAndOrganizationOrganizationId(Long employeeId, Long organizationId);
    
    long countByOrganizationOrganizationId(Long organizationId);
    
    long countByOrganizationOrganizationIdAndIsLeaderTrue(Long organizationId);
}
