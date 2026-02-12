package com.tricenter.service;

import com.tricenter.dto.request.PatentRequest;
import com.tricenter.dto.request.ProductCreateRequest;
import com.tricenter.dto.request.ProductUpdateRequest;
import com.tricenter.dto.response.PatentResponse;
import com.tricenter.dto.response.ProductResponse;

import java.util.List;

/**
 * 企业产品服务接口
 */
public interface ProductService {
    
    /**
     * 获取企业产品列表
     */
    List<ProductResponse> getProductsByEnterpriseId(Integer enterpriseId);
    
    /**
     * 添加企业产品
     */
    ProductResponse createProduct(Integer enterpriseId, ProductCreateRequest request);
    
    /**
     * 更新企业产品
     */
    ProductResponse updateProduct(Integer enterpriseId, Integer productId, ProductUpdateRequest request);
    
    /**
     * 删除企业产品
     */
    void deleteProduct(Integer enterpriseId, Integer productId);
    
    /**
     * 获取企业专利列表
     */
    List<PatentResponse> getPatentsByEnterpriseId(Integer enterpriseId);
    
    /**
     * 添加企业专利
     */
    PatentResponse createPatent(Integer enterpriseId, PatentRequest request);
    
    /**
     * 更新企业专利
     */
    PatentResponse updatePatent(Integer enterpriseId, Integer patentId, PatentRequest request);
    
    /**
     * 删除企业专利
     */
    void deletePatent(Integer enterpriseId, Integer patentId);
}
