package com.tricenter.controller;

import com.tricenter.common.result.PageResult;
import com.tricenter.common.result.Result;
import com.tricenter.dto.request.FollowUpCreateRequest;
import com.tricenter.dto.request.FollowUpQueryRequest;
import com.tricenter.dto.request.FollowUpUpdateRequest;
import com.tricenter.dto.response.FollowUpResponse;
import com.tricenter.dto.response.FollowUpStatsResponse;
import com.tricenter.security.LoginUser;
import com.tricenter.service.FollowUpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 跟进记录控制器
 */
@Tag(name = "跟进记录管理", description = "跟进记录的CRUD和统计操作")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService followUpService;

    @Operation(summary = "获取跟进记录列表", description = "支持按企业筛选、按类型筛选、关键词搜索")
    @GetMapping("/follow-ups")
    public Result<PageResult<FollowUpResponse>> getFollowUpList(FollowUpQueryRequest request) {
        PageResult<FollowUpResponse> result = followUpService.getFollowUpList(request);
        return Result.success(result);
    }

    @Operation(summary = "获取企业跟进记录", description = "获取指定企业的所有跟进记录")
    @GetMapping("/enterprises/{enterpriseId}/follow-ups")
    public Result<List<FollowUpResponse>> getEnterpriseFollowUps(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId) {
        List<FollowUpResponse> list = followUpService.getFollowUpsByEnterpriseId(enterpriseId);
        return Result.success(list);
    }

    @Operation(summary = "新增跟进记录", description = "新增跟进记录，可选同时变更企业阶段")
    @PostMapping("/follow-ups")
    public Result<FollowUpResponse> createFollowUp(
            @Valid @RequestBody FollowUpCreateRequest request,
            @AuthenticationPrincipal LoginUser loginUser) {
        FollowUpResponse response = followUpService.createFollowUp(request, loginUser.getId());
        return Result.success(response);
    }

    @Operation(summary = "更新跟进记录", description = "更新跟进记录信息")
    @PutMapping("/follow-ups/{id}")
    public Result<FollowUpResponse> updateFollowUp(
            @Parameter(description = "跟进记录ID") @PathVariable Integer id,
            @Valid @RequestBody FollowUpUpdateRequest request) {
        FollowUpResponse response = followUpService.updateFollowUp(id, request);
        return Result.success(response);
    }

    @Operation(summary = "删除跟进记录", description = "删除跟进记录")
    @DeleteMapping("/follow-ups/{id}")
    public Result<Void> deleteFollowUp(
            @Parameter(description = "跟进记录ID") @PathVariable Integer id) {
        followUpService.deleteFollowUp(id);
        return Result.success();
    }

    @Operation(summary = "获取跟进统计", description = "获取跟进记录统计数据（本月/本周/今日/待跟进）")
    @GetMapping("/follow-ups/stats")
    public Result<FollowUpStatsResponse> getFollowUpStats() {
        FollowUpStatsResponse stats = followUpService.getFollowUpStats();
        return Result.success(stats);
    }
}
