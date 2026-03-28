package com.tricenter.controller;

import com.tricenter.common.result.PageResult;
import com.tricenter.common.result.Result;
import com.tricenter.entity.EnterpriseServiceRecord;
import com.tricenter.security.LoginUser;
import com.tricenter.service.EnterpriseServiceRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "合作服务记录", description = "企业合作服务记录的CRUD")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EnterpriseServiceRecordController {

    private final EnterpriseServiceRecordService serviceRecordService;

    @Operation(summary = "全局服务记录列表", description = "分页查询所有企业的服务记录，支持按企业/服务商/类型/状态筛选")
    @GetMapping("/service-records")
    public Result<PageResult<EnterpriseServiceRecord>> getGlobalList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "企业ID") @RequestParam(required = false) Integer enterpriseId,
            @Parameter(description = "服务商ID") @RequestParam(required = false) Integer providerId,
            @Parameter(description = "服务类型") @RequestParam(required = false) String serviceType,
            @Parameter(description = "状态") @RequestParam(required = false) String status) {
        return Result.success(serviceRecordService.getGlobalPage(page, pageSize, enterpriseId, providerId, serviceType, status));
    }

    @Operation(summary = "获取企业服务记录", description = "获取指定企业的所有服务记录")
    @GetMapping("/enterprises/{enterpriseId}/services")
    public Result<List<EnterpriseServiceRecord>> getByEnterprise(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId) {
        return Result.success(serviceRecordService.getByEnterpriseId(enterpriseId));
    }

    @Operation(summary = "新增服务记录", description = "为企业新增一条合作服务记录")
    @PostMapping("/enterprises/{enterpriseId}/services")
    public Result<EnterpriseServiceRecord> create(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @RequestBody EnterpriseServiceRecord body,
            @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(serviceRecordService.create(enterpriseId, body, loginUser.getId()));
    }

    @Operation(summary = "更新服务记录")
    @PutMapping("/enterprises/{enterpriseId}/services/{id}")
    public Result<EnterpriseServiceRecord> update(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "记录ID") @PathVariable Integer id,
            @RequestBody EnterpriseServiceRecord body) {
        return Result.success(serviceRecordService.update(enterpriseId, id, body));
    }

    @Operation(summary = "删除服务记录")
    @DeleteMapping("/enterprises/{enterpriseId}/services/{id}")
    public Result<Void> delete(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "记录ID") @PathVariable Integer id) {
        serviceRecordService.delete(enterpriseId, id);
        return Result.success();
    }
}
