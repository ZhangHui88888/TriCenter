package com.tricenter.controller;

import com.tricenter.common.result.PageResult;
import com.tricenter.common.result.Result;
import com.tricenter.annotation.OpLog;
import com.tricenter.dto.request.*;
import com.tricenter.dto.response.EnterpriseDetailResponse;
import com.tricenter.dto.response.EnterpriseListResponse;
import com.tricenter.dto.response.EnterpriseOverviewStatsResponse;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseContact;
import com.tricenter.security.LoginUser;
import com.tricenter.service.EnterpriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 企业管理控制器
 */
@Tag(name = "企业管理", description = "企业CRUD、阶段变更、联系人管理等")
@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @Operation(summary = "企业列表", description = "分页查询企业列表，支持多条件筛选")
    @GetMapping
    public Result<PageResult<EnterpriseListResponse>> getEnterpriseList(EnterpriseQueryRequest request) {
        PageResult<EnterpriseListResponse> result = enterpriseService.getEnterpriseList(request);
        return Result.success(result);
    }

    @Operation(summary = "企业概览统计", description = "与列表相同的筛选条件，统计匹配全量企业的数量与上年外贸营业额（万元）；出口额按是否开展跨境电商拆分")
    @GetMapping("/overview-stats")
    public Result<EnterpriseOverviewStatsResponse> getOverviewStats(EnterpriseQueryRequest request) {
        return Result.success(enterpriseService.getOverviewStats(request));
    }

    @Operation(summary = "企业详情", description = "获取单个企业的完整信息")
    @GetMapping("/{id}")
    public Result<EnterpriseDetailResponse> getEnterpriseDetail(
            @Parameter(description = "企业ID") @PathVariable Integer id) {
        EnterpriseDetailResponse detail = enterpriseService.getEnterpriseDetail(id);
        return Result.success(detail);
    }

    @OpLog(operation = "CREATE", targetType = "ENTERPRISE")
    @Operation(summary = "新增企业", description = "创建新企业记录，同时创建主要联系人")
    @PostMapping
    public Result<Enterprise> createEnterprise(@Valid @RequestBody EnterpriseCreateRequest request) {
        Enterprise enterprise = enterpriseService.createEnterprise(request);
        return Result.success(enterprise);
    }

    @OpLog(operation = "UPDATE", targetType = "ENTERPRISE")
    @Operation(summary = "编辑企业", description = "更新企业信息")
    @PutMapping("/{id}")
    public Result<Enterprise> updateEnterprise(
            @Parameter(description = "企业ID") @PathVariable Integer id,
            @Valid @RequestBody EnterpriseUpdateRequest request) {
        Enterprise enterprise = enterpriseService.updateEnterprise(id, request);
        return Result.success(enterprise);
    }

    @OpLog(operation = "DELETE", targetType = "ENTERPRISE")
    @Operation(summary = "删除企业", description = "软删除企业记录")
    @DeleteMapping("/{id}")
    public Result<Void> deleteEnterprise(
            @Parameter(description = "企业ID") @PathVariable Integer id) {
        enterpriseService.deleteEnterprise(id);
        return Result.success();
    }

    @OpLog(operation = "STAGE_CHANGE", targetType = "ENTERPRISE")
    @Operation(summary = "变更漏斗阶段", description = "变更企业漏斗阶段，同时记录变更日志")
    @PatchMapping("/{id}/stage")
    public Result<Void> changeStage(
            @Parameter(description = "企业ID") @PathVariable Integer id,
            @Valid @RequestBody StageChangeRequest request,
            @AuthenticationPrincipal LoginUser loginUser) {
        enterpriseService.changeStage(id, request, loginUser.getId());
        return Result.success();
    }

    @Operation(summary = "获取企业联系人", description = "获取指定企业的所有联系人")
    @GetMapping("/{id}/contacts")
    public Result<List<EnterpriseContact>> getContacts(
            @Parameter(description = "企业ID") @PathVariable Integer id) {
        List<EnterpriseContact> contacts = enterpriseService.getContacts(id);
        return Result.success(contacts);
    }

    @Operation(summary = "更新企业联系人", description = "批量更新企业联系人（全量替换）")
    @PutMapping("/{id}/contacts")
    public Result<List<EnterpriseContact>> updateContacts(
            @Parameter(description = "企业ID") @PathVariable Integer id,
            @Valid @RequestBody ContactUpdateRequest request) {
        List<EnterpriseContact> contacts = enterpriseService.updateContacts(id, request);
        return Result.success(contacts);
    }

    @OpLog(operation = "IMPORT", targetType = "ENTERPRISE", detail = "批量导入企业")
    @Operation(summary = "批量导入企业", description = "通过Excel文件批量导入企业数据")
    @PostMapping("/import")
    public Result<ImportResultResponse> importEnterprises(
            @Parameter(description = "Excel文件") @RequestParam("file") MultipartFile file) {
        ImportResultResponse result = enterpriseService.importEnterprises(file);
        return Result.success(result);
    }

    @OpLog(operation = "BATCH_DELETE", targetType = "ENTERPRISE", detail = "批量删除企业")
    @Operation(summary = "批量删除企业", description = "批量软删除多个企业记录")
    @DeleteMapping("/batch")
    public Result<Integer> batchDelete(@Valid @RequestBody BatchDeleteRequest request) {
        int count = enterpriseService.batchDelete(request.getIds());
        return Result.success(count);
    }

    @OpLog(operation = "BATCH_STAGE_CHANGE", targetType = "ENTERPRISE", detail = "批量变更阶段")
    @Operation(summary = "批量变更阶段", description = "批量变更多个企业的漏斗阶段")
    @PatchMapping("/batch/stage")
    public Result<Integer> batchChangeStage(
            @Valid @RequestBody BatchStageChangeRequest request,
            @AuthenticationPrincipal LoginUser loginUser) {
        int count = enterpriseService.batchChangeStage(
                request.getIds(), request.getStage(), request.getReason(), loginUser.getId());
        return Result.success(count);
    }

    @Operation(summary = "导出企业列表", description = "导出企业列表为Excel文件")
    @GetMapping("/export")
    public void exportEnterprises(EnterpriseQueryRequest request, HttpServletResponse response) {
        enterpriseService.exportEnterprises(request, response);
    }

    @Operation(summary = "下载导入模板", description = "下载企业批量导入的Excel模板")
    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) {
        enterpriseService.downloadTemplate(response);
    }
}
