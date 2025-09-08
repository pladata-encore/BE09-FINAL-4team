package com.hermes.attendanceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "user-service", url = "${user-service.url:http://localhost:8081}")
public interface UserServiceClient {
    
    @GetMapping("/api/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
    
    @GetMapping("/api/users/count")
    Map<String, Object> getTotalEmployees();
    
    /**
     * 사용자의 근무년수 조회
     */
    @GetMapping("/api/users/{userId}/work-years")
    Map<String, Integer> getUserWorkYears(@PathVariable("userId") Long userId);
} 