package com.tricenter.service;

import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.FollowUpCreateRequest;
import com.tricenter.dto.request.FollowUpQueryRequest;
import com.tricenter.dto.request.FollowUpUpdateRequest;
import com.tricenter.dto.response.FollowUpResponse;
import com.tricenter.dto.response.FollowUpStatsResponse;

import java.util.List;

/**
 * 跟进记录服务接口
 */
public interface FollowUpService {
    
    /**
     * 分页查询跟进记录列表
     */
    PageResult<FollowUpResponse> getFollowUpList(FollowUpQueryRequest request);
    
    /**
     * 获取企业的跟进记录
     */
    List<FollowUpResponse> getFollowUpsByEnterpriseId(Integer enterpriseId);
    
    /**
     * 新增跟进记录
     */
    FollowUpResponse createFollowUp(FollowUpCreateRequest request, Integer currentUserId);
    
    /**
     * 更新跟进记录
     */
    FollowUpResponse updateFollowUp(Integer id, FollowUpUpdateRequest request);
    
    /**
     * 删除跟进记录
     */
    void deleteFollowUp(Integer id);
    
    /**
     * 获取跟进统计
     */
    FollowUpStatsResponse getFollowUpStats();
}
