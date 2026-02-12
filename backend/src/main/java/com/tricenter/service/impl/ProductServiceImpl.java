package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.PatentRequest;
import com.tricenter.dto.request.ProductCreateRequest;
import com.tricenter.dto.request.ProductUpdateRequest;
import com.tricenter.dto.response.PatentResponse;
import com.tricenter.dto.response.ProductResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterprisePatent;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.entity.SystemOption;
import com.tricenter.entity.ProductCategory;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.EnterprisePatentMapper;
import com.tricenter.mapper.EnterpriseProductMapper;
import com.tricenter.mapper.SystemOptionMapper;
import com.tricenter.mapper.ProductCategoryMapper;
import com.tricenter.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 企业产品服务实现
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final EnterpriseProductMapper productMapper;
    private final EnterprisePatentMapper patentMapper;
    private final EnterpriseMapper enterpriseMapper;
    private final SystemOptionMapper systemOptionMapper;
    private final ProductCategoryMapper productCategoryMapper;

    @Override
    public List<ProductResponse> getProductsByEnterpriseId(Integer enterpriseId) {
        checkEnterpriseExists(enterpriseId);
        
        List<EnterpriseProduct> products = productMapper.selectList(
            new LambdaQueryWrapper<EnterpriseProduct>()
                .eq(EnterpriseProduct::getEnterpriseId, enterpriseId)
                .orderByDesc(EnterpriseProduct::getCreatedAt)
        );
        
        return products.stream()
            .map(this::convertToProductResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse createProduct(Integer enterpriseId, ProductCreateRequest request) {
        checkEnterpriseExists(enterpriseId);
        
        EnterpriseProduct product = new EnterpriseProduct();
        BeanUtils.copyProperties(request, product);
        product.setEnterpriseId(enterpriseId);
        
        productMapper.insert(product);
        
        return convertToProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer enterpriseId, Integer productId, ProductUpdateRequest request) {
        checkEnterpriseExists(enterpriseId);
        
        EnterpriseProduct product = productMapper.selectById(productId);
        if (product == null || !product.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("产品不存在");
        }
        
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getCategoryId() != null) {
            product.setCategoryId(request.getCategoryId());
        }
        if (request.getCertificationIds() != null) {
            product.setCertificationIds(request.getCertificationIds());
        }
        if (request.getTargetRegionIds() != null) {
            product.setTargetRegionIds(request.getTargetRegionIds());
        }
        if (request.getTargetCountryIds() != null) {
            product.setTargetCountryIds(request.getTargetCountryIds());
        }
        if (request.getAnnualSales() != null) {
            product.setAnnualSales(request.getAnnualSales());
        }
        if (request.getLocalProcurementRatio() != null) {
            product.setLocalProcurementRatio(request.getLocalProcurementRatio());
        }
        if (request.getAutomationLevelId() != null) {
            product.setAutomationLevelId(request.getAutomationLevelId());
        }
        if (request.getAnnualCapacity() != null) {
            product.setAnnualCapacity(request.getAnnualCapacity());
        }
        if (request.getLogisticsPartnerIds() != null) {
            product.setLogisticsPartnerIds(request.getLogisticsPartnerIds());
        }
        
        productMapper.updateById(product);
        
        return convertToProductResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer enterpriseId, Integer productId) {
        checkEnterpriseExists(enterpriseId);
        
        EnterpriseProduct product = productMapper.selectById(productId);
        if (product == null || !product.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("产品不存在");
        }
        
        productMapper.deleteById(productId);
    }

    @Override
    public List<PatentResponse> getPatentsByEnterpriseId(Integer enterpriseId) {
        checkEnterpriseExists(enterpriseId);
        
        List<EnterprisePatent> patents = patentMapper.selectList(
            new LambdaQueryWrapper<EnterprisePatent>()
                .eq(EnterprisePatent::getEnterpriseId, enterpriseId)
                .orderByDesc(EnterprisePatent::getCreatedAt)
        );
        
        return patents.stream()
            .map(this::convertToPatentResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PatentResponse createPatent(Integer enterpriseId, PatentRequest request) {
        checkEnterpriseExists(enterpriseId);
        
        EnterprisePatent patent = new EnterprisePatent();
        patent.setEnterpriseId(enterpriseId);
        patent.setName(request.getName());
        patent.setPatentNo(request.getPatentNo());
        
        patentMapper.insert(patent);
        
        return convertToPatentResponse(patent);
    }

    @Override
    @Transactional
    public PatentResponse updatePatent(Integer enterpriseId, Integer patentId, PatentRequest request) {
        checkEnterpriseExists(enterpriseId);
        
        EnterprisePatent patent = patentMapper.selectById(patentId);
        if (patent == null || !patent.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("专利不存在");
        }
        
        patent.setName(request.getName());
        patent.setPatentNo(request.getPatentNo());
        
        patentMapper.updateById(patent);
        
        return convertToPatentResponse(patent);
    }

    @Override
    @Transactional
    public void deletePatent(Integer enterpriseId, Integer patentId) {
        checkEnterpriseExists(enterpriseId);
        
        EnterprisePatent patent = patentMapper.selectById(patentId);
        if (patent == null || !patent.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("专利不存在");
        }
        
        patentMapper.deleteById(patentId);
    }

    private void checkEnterpriseExists(Integer enterpriseId) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null) {
            throw new BusinessException("企业不存在");
        }
    }

    private ProductResponse convertToProductResponse(EnterpriseProduct product) {
        ProductResponse response = new ProductResponse();
        BeanUtils.copyProperties(product, response);
        
        // 获取品类名称
        if (product.getCategoryId() != null) {
            ProductCategory category = productCategoryMapper.selectById(product.getCategoryId());
            if (category != null) {
                response.setCategoryName(category.getName());
            }
        }
        
        // 获取认证名称列表
        if (product.getCertificationIds() != null && !product.getCertificationIds().isEmpty()) {
            response.setCertificationNames(getOptionLabels("certification", product.getCertificationIds()));
        }
        
        // 获取销售区域名称列表
        if (product.getTargetRegionIds() != null && !product.getTargetRegionIds().isEmpty()) {
            response.setTargetRegionNames(getOptionLabels("region", product.getTargetRegionIds()));
        }
        
        // 获取自动化程度名称
        if (product.getAutomationLevelId() != null) {
            SystemOption option = systemOptionMapper.selectById(product.getAutomationLevelId());
            if (option != null) {
                response.setAutomationLevelName(option.getLabel());
            }
        }
        
        // 获取物流合作方名称列表
        if (product.getLogisticsPartnerIds() != null && !product.getLogisticsPartnerIds().isEmpty()) {
            response.setLogisticsPartnerNames(getOptionLabels("logistics", product.getLogisticsPartnerIds()));
        }
        
        return response;
    }

    private List<String> getOptionLabels(String category, List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<SystemOption> options = systemOptionMapper.selectList(
            new LambdaQueryWrapper<SystemOption>()
                .eq(SystemOption::getCategory, category)
                .in(SystemOption::getId, ids)
        );
        
        Map<Integer, String> optionMap = options.stream()
            .collect(Collectors.toMap(SystemOption::getId, SystemOption::getLabel));
        
        return ids.stream()
            .map(id -> optionMap.getOrDefault(id, ""))
            .filter(label -> !label.isEmpty())
            .collect(Collectors.toList());
    }

    private PatentResponse convertToPatentResponse(EnterprisePatent patent) {
        PatentResponse response = new PatentResponse();
        BeanUtils.copyProperties(patent, response);
        return response;
    }
}
