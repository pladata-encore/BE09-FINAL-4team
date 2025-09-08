package com.hermes.attendanceservice.entity.leave;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Instant;
import java.time.LocalTime;

@Entity
@Table(name = "leave_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;
    
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveType leaveType;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Column(name = "total_days", nullable = false)
    private Double totalDays;
    
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;
    
    @Column(name = "approver_id")
    private Long approverId;
    
    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;
    
    @Column(name = "approved_at")
    private Instant approvedAt;
    
    public enum RequestStatus {
        REQUESTED,   // 신청
        APPROVED,    // 승인
        REJECTED,    // 반려
        CANCELLED    // 취소
    }
    
    /**
     * CreateLeaveRequestDto로부터 LeaveRequest 엔티티를 생성하는 정적 팩토리 메서드
     */
    public static LeaveRequest createFromDto(com.hermes.attendanceservice.dto.leave.CreateLeaveRequestDto createDto, double totalDays) {
        return LeaveRequest.builder()
                .employeeId(createDto.getEmployeeId())
                .leaveType(createDto.getLeaveType())
                .startDate(createDto.getStartDate())
                .endDate(createDto.getEndDate())
                .startTime(createDto.getStartTime())
                .endTime(createDto.getEndTime())
                .totalDays(totalDays)
                .reason(createDto.getReason())
                .status(RequestStatus.REQUESTED)
                .requestedAt(Instant.now())
                .build();
    }
} 
