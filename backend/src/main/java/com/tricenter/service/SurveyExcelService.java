package com.tricenter.service;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;
import com.tricenter.dto.response.ImportResultResponse;

/**
 * 调研Excel导入导出服务接口
 */
public interface SurveyExcelService {

    /**
     * 导出单个企业的调研Excel（预填已有数据）
     */
    void exportSurveyExcel(Integer enterpriseId, HttpServletResponse response);

    /**
     * 批量导出企业调研Excel（多企业合并到一个文件）
     */
    void exportBatchSurveyExcel(java.util.List<Integer> enterpriseIds, HttpServletResponse response);

    /**
     * 导入调研Excel数据（更新已有企业）
     */
    ImportResultResponse importSurveyExcel(MultipartFile file);

    /**
     * 下载调研导入模板（包含所有现有企业的空白行）
     */
    void downloadTemplate(HttpServletResponse response);
}
