package com.tricenter.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.result.Result;
import com.tricenter.entity.OperationLog;
import com.tricenter.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 操作日志控制器
 */
@Tag(name = "操作日志", description = "查询系统操作日志")
@RestController
@RequestMapping("/api/operation-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('audit:view')")
@Validated
public class OperationLogController {

    private final OperationLogService operationLogService;

    @Operation(summary = "查询操作日志", description = "分页查询操作日志，支持按类型筛选")
    @GetMapping
    public Result<Page<OperationLog>> getLogList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @Parameter(description = "操作对象类型") @RequestParam(required = false) String targetType,
            @Parameter(description = "操作类型") @RequestParam(required = false) String operation) {
        Page<OperationLog> result = operationLogService.getLogList(page, size, targetType, operation);
        return Result.success(result);
    }
}
