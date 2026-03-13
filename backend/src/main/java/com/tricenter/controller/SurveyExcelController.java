package com.tricenter.controller;

import com.tricenter.annotation.OpLog;
import com.tricenter.common.result.Result;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.service.SurveyExcelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 调研Excel导入导出控制器
 */
@Tag(name = "调研Excel", description = "企业调研表导出/导入，用于线下拜访数据收集")
@RestController
@RequestMapping("/api/survey-excel")
@RequiredArgsConstructor
public class SurveyExcelController {

    private final SurveyExcelService surveyExcelService;

    @Operation(summary = "导出单个企业调研表", description = "导出指定企业的调研Excel，预填已有数据供线下补充")
    @GetMapping("/export/{enterpriseId}")
    public void exportSurveyExcel(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            HttpServletResponse response) {
        surveyExcelService.exportSurveyExcel(enterpriseId, response);
    }

    @Operation(summary = "批量导出企业调研表", description = "批量导出多个企业的调研Excel到一个文件")
    @PostMapping("/export/batch")
    public void exportBatchSurveyExcel(
            @Parameter(description = "企业ID列表") @RequestBody List<Integer> enterpriseIds,
            HttpServletResponse response) {
        surveyExcelService.exportBatchSurveyExcel(enterpriseIds, response);
    }

    @OpLog(operation = "IMPORT", targetType = "ENTERPRISE", detail = "导入调研数据")
    @Operation(summary = "导入调研数据", description = "导入填写好的调研Excel，更新企业数据")
    @PostMapping("/import")
    public Result<ImportResultResponse> importSurveyExcel(
            @Parameter(description = "调研Excel文件") @RequestParam("file") MultipartFile file) {
        ImportResultResponse result = surveyExcelService.importSurveyExcel(file);
        return Result.success(result);
    }

    @Operation(summary = "下载调研导入模板", description = "下载包含所有现有企业的调研Excel模板，供线下填写后导入")
    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) {
        surveyExcelService.downloadTemplate(response);
    }
}
