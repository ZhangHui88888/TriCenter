package com.tricenter.service;

import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.ProviderCreateRequest;
import com.tricenter.dto.request.ProviderQueryRequest;
import com.tricenter.dto.request.ProviderUpdateRequest;
import com.tricenter.dto.response.ProviderDetailResponse;
import com.tricenter.dto.response.ProviderListResponse;
import com.tricenter.entity.Provider;

/**
 * 服务商服务接口
 */
public interface ProviderService {

    /**
     * 分页查询服务商列表
     */
    PageResult<ProviderListResponse> getProviderList(ProviderQueryRequest request);

    /**
     * 获取服务商详情
     */
    ProviderDetailResponse getProviderDetail(Integer id);

    /**
     * 创建服务商
     */
    Provider createProvider(ProviderCreateRequest request);

    /**
     * 更新服务商
     */
    Provider updateProvider(Integer id, ProviderUpdateRequest request);

    /**
     * 删除服务商（软删除）
     */
    void deleteProvider(Integer id);
}
