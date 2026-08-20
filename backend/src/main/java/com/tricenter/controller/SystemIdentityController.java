package com.tricenter.controller;

import com.tricenter.common.result.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemIdentityController {

    private final String applicationName;

    public SystemIdentityController(
            @Value("${spring.application.name}") String applicationName) {
        this.applicationName = applicationName;
    }

    @GetMapping("/identity")
    public Result<Map<String, String>> identity() {
        return Result.success(Map.of("application", applicationName));
    }
}
