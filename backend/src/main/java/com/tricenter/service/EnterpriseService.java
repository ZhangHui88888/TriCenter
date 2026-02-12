package com.tricenter.service;

import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.*;
import com.tricenter.dto.response.EnterpriseDetailResponse;
import com.tricenter.dto.response.EnterpriseListResponse;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseContact;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * 企业服务接口
 */
public interface EnterpriseService {
    
    /**
     * 分页查询企业列表
     */
    PageResult<EnterpriseListResponse> getEnterpriseList(EnterpriseQueryRequest request);
    
    /**
     * 获取企业详情
     */
    EnterpriseDetailResponse getEnterpriseDetail(Integer id);
    
    /**
     * 创建企业
     */
    Enterprise createEnterprise(EnterpriseCreateRequest request);
    
    /**
     * 更新企业
     */
    Enterprise updateEnterprise(Integer id, EnterpriseUpdateRequest request);
    
    /**
     * 删除企业（软删除）
     */
    void deleteEnterprise(Integer id);
    
    /**
     * 变更漏斗阶段
     */
    void changeStage(Integer id, StageChangeRequest request, Integer operatorId);
    
    /**
     * 更新企业联系人
     */
    List<EnterpriseContact> updateContacts(Integer enterpriseId, ContactUpdateRequest request);
    
    /**
     * 获取企业联系人列表
     */
    List<EnterpriseContact> getContacts(Integer enterpriseId);
    
    /**
     * 批量导入企业
     */
    ImportResultResponse importEnterprises(MultipartFile file);
    
    /**
     * 导出企业列表
     */
    void exportEnterprises(EnterpriseQueryRequest request, HttpServletResponse response);
    
    /**
     * 下载导入模板
     */
    void downloadTemplate(HttpServletResponse response);
}
