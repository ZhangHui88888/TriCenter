package com.tricenter.service.impl;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.common.result.PageResult;
import com.tricenter.dto.excel.EnterpriseExcelData;
import com.tricenter.dto.request.*;
import com.tricenter.dto.response.EnterpriseDetailResponse;
import com.tricenter.dto.response.EnterpriseListResponse;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.entity.*;
import com.tricenter.mapper.*;
import com.tricenter.service.EnterpriseService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 企业服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseMapper enterpriseMapper;
    private final EnterpriseContactMapper contactMapper;
    private final EnterpriseProductMapper productMapper;
    private final EnterprisePatentMapper patentMapper;
    private final ProductCategoryMapper productCategoryMapper;
    private final StageChangeLogMapper stageChangeLogMapper;
    private final IndustryCategoryMapper industryCategoryMapper;
    private final SystemOptionMapper systemOptionMapper;
    private final UserMapper userMapper;

    @Override
    public PageResult<EnterpriseListResponse> getEnterpriseList(EnterpriseQueryRequest request) {
        Page<Enterprise> page = new Page<>(request.getPage(), request.getPageSize());
        
        LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Enterprise::getIsDeleted, 0);
        
        // 关键词搜索
        if (StringUtils.hasText(request.getKeyword())) {
            wrapper.like(Enterprise::getName, request.getKeyword());
        }
        // 阶段筛选
        if (StringUtils.hasText(request.getStage())) {
            wrapper.eq(Enterprise::getStage, request.getStage());
        }
        // 区域筛选
        if (StringUtils.hasText(request.getDistrict())) {
            wrapper.eq(Enterprise::getDistrict, request.getDistrict());
        }
        // 行业筛选
        if (request.getIndustryId() != null) {
            wrapper.eq(Enterprise::getIndustryId, request.getIndustryId());
        }
        // 企业类型筛选
        if (StringUtils.hasText(request.getEnterpriseType())) {
            wrapper.eq(Enterprise::getEnterpriseType, request.getEnterpriseType());
        }
        // 人员规模筛选
        if (request.getStaffSizeId() != null) {
            wrapper.eq(Enterprise::getStaffSizeId, request.getStaffSizeId());
        }
        // 来源筛选
        if (request.getSourceId() != null) {
            wrapper.eq(Enterprise::getSourceId, request.getSourceId());
        }
        // 是否跨境筛选
        if (request.getHasCrossBorder() != null) {
            wrapper.eq(Enterprise::getHasCrossBorder, request.getHasCrossBorder());
        }
        // 转型意愿筛选
        if (StringUtils.hasText(request.getTransformationWillingness())) {
            wrapper.eq(Enterprise::getTransformationWillingness, request.getTransformationWillingness());
        }
        
        wrapper.orderByDesc(Enterprise::getCreatedAt);
        
        Page<Enterprise> result = enterpriseMapper.selectPage(page, wrapper);
        
        // 转换为响应对象
        List<EnterpriseListResponse> list = result.getRecords().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResult.of(list, result.getTotal(), request.getPage(), request.getPageSize());
    }

    @Override
    public EnterpriseDetailResponse getEnterpriseDetail(Integer id) {
        Enterprise enterprise = enterpriseMapper.selectById(id);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw BusinessException.notFound("企业不存在");
        }
        
        return convertToDetailResponse(enterprise);
    }

    @Override
    @Transactional
    public Enterprise createEnterprise(EnterpriseCreateRequest request) {
        // 如果提供了企业名称，检查是否重复
        if (StringUtils.hasText(request.getName())) {
            LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Enterprise::getName, request.getName())
                   .eq(Enterprise::getIsDeleted, 0);
            if (enterpriseMapper.selectCount(wrapper) > 0) {
                throw BusinessException.badRequest("企业名称已存在");
            }
        }
        
        // 创建企业
        Enterprise enterprise = new Enterprise();
        BeanUtils.copyProperties(request, enterprise);
        
        // 如果没有提供企业名称，生成默认名称
        if (!StringUtils.hasText(enterprise.getName())) {
            enterprise.setName("新建企业_" + System.currentTimeMillis());
        }
        
        // 设置必要的默认值（数据库字段不允许为空）
        if (!StringUtils.hasText(enterprise.getDistrict())) {
            enterprise.setDistrict("待填写");
        }
        if (!StringUtils.hasText(enterprise.getProvince())) {
            enterprise.setProvince("江苏省");
        }
        if (!StringUtils.hasText(enterprise.getCity())) {
            enterprise.setCity("常州市");
        }
        if (!StringUtils.hasText(enterprise.getEnterpriseType())) {
            enterprise.setEnterpriseType("待确认");
        }
        
        enterprise.setStage("POTENTIAL"); // 默认阶段：潜在企业
        enterprise.setIsDeleted(0);
        
        enterpriseMapper.insert(enterprise);
        
        // 如果提供了联系人信息，创建主要联系人
        if (StringUtils.hasText(request.getContactName()) && StringUtils.hasText(request.getContactPhone())) {
            EnterpriseContact contact = new EnterpriseContact();
            contact.setEnterpriseId(enterprise.getId());
            contact.setName(request.getContactName());
            contact.setPhone(request.getContactPhone());
            contact.setPosition(request.getContactPosition());
            contact.setIsPrimary(1);
            contactMapper.insert(contact);
        }
        
        log.info("创建企业成功: id={}, name={}", enterprise.getId(), enterprise.getName());
        
        return enterprise;
    }

    @Override
    @Transactional
    public Enterprise updateEnterprise(Integer id, EnterpriseUpdateRequest request) {
        Enterprise enterprise = enterpriseMapper.selectById(id);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw BusinessException.notFound("企业不存在");
        }
        
        // 如果修改了名称，检查是否重复
        if (StringUtils.hasText(request.getName()) && !request.getName().equals(enterprise.getName())) {
            LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Enterprise::getName, request.getName())
                   .eq(Enterprise::getIsDeleted, 0)
                   .ne(Enterprise::getId, id);
            if (enterpriseMapper.selectCount(wrapper) > 0) {
                throw BusinessException.badRequest("企业名称已存在");
            }
        }
        
        // 更新非空字段
        if (request.getName() != null) enterprise.setName(request.getName());
        if (request.getCreditCode() != null) enterprise.setCreditCode(request.getCreditCode());
        if (request.getProvince() != null) enterprise.setProvince(request.getProvince());
        if (request.getCity() != null) enterprise.setCity(request.getCity());
        if (request.getDistrict() != null) enterprise.setDistrict(request.getDistrict());
        if (request.getAddress() != null) enterprise.setAddress(request.getAddress());
        if (request.getIndustryId() != null) enterprise.setIndustryId(request.getIndustryId());
        if (request.getEnterpriseType() != null) enterprise.setEnterpriseType(request.getEnterpriseType());
        if (request.getStaffSizeId() != null) enterprise.setStaffSizeId(request.getStaffSizeId());
        if (request.getWebsite() != null) enterprise.setWebsite(request.getWebsite());
        if (request.getDomesticRevenueId() != null) enterprise.setDomesticRevenueId(request.getDomesticRevenueId());
        if (request.getCrossBorderRevenueId() != null) enterprise.setCrossBorderRevenueId(request.getCrossBorderRevenueId());
        if (request.getSourceId() != null) enterprise.setSourceId(request.getSourceId());
        
        // 品牌信息
        if (request.getHasOwnBrand() != null) enterprise.setHasOwnBrand(request.getHasOwnBrand());
        if (request.getBrandNames() != null) enterprise.setBrandNames(request.getBrandNames());
        
        // 外贸信息
        if (request.getTargetRegionIds() != null) enterprise.setTargetRegionIds(request.getTargetRegionIds());
        if (request.getTargetCountryIds() != null) enterprise.setTargetCountryIds(request.getTargetCountryIds());
        if (request.getTradeModeId() != null) enterprise.setTradeModeId(request.getTradeModeId());
        if (request.getHasImportExportLicense() != null) enterprise.setHasImportExportLicense(request.getHasImportExportLicense());
        if (request.getCustomsDeclarationMode() != null) enterprise.setCustomsDeclarationMode(request.getCustomsDeclarationMode());
        if (request.getTradeTeamModeId() != null) enterprise.setTradeTeamModeId(request.getTradeTeamModeId());
        if (request.getTradeTeamSize() != null) enterprise.setTradeTeamSize(request.getTradeTeamSize());
        if (request.getHasDomesticEcommerce() != null) enterprise.setHasDomesticEcommerce(request.getHasDomesticEcommerce());
        
        // 外贸业绩
        if (request.getLastYearRevenue() != null) enterprise.setLastYearRevenue(request.getLastYearRevenue());
        if (request.getYearBeforeLastRevenue() != null) enterprise.setYearBeforeLastRevenue(request.getYearBeforeLastRevenue());
        if (request.getMarketChanges() != null) enterprise.setMarketChanges(request.getMarketChanges());
        if (request.getModeChanges() != null) enterprise.setModeChanges(request.getModeChanges());
        if (request.getCategoryChanges() != null) enterprise.setCategoryChanges(request.getCategoryChanges());
        if (request.getGrowthReasons() != null) enterprise.setGrowthReasons(request.getGrowthReasons());
        if (request.getDeclineReasons() != null) enterprise.setDeclineReasons(request.getDeclineReasons());
        
        // 跨境电商信息
        if (request.getHasCrossBorder() != null) enterprise.setHasCrossBorder(request.getHasCrossBorder());
        if (request.getCrossBorderRatio() != null) enterprise.setCrossBorderRatio(request.getCrossBorderRatio());
        if (request.getCrossBorderLogistics() != null) enterprise.setCrossBorderLogistics(request.getCrossBorderLogistics());
        if (request.getPaymentSettlement() != null) enterprise.setPaymentSettlement(request.getPaymentSettlement());
        if (request.getCrossBorderTeamSize() != null) enterprise.setCrossBorderTeamSize(request.getCrossBorderTeamSize());
        if (request.getUsingErp() != null) enterprise.setUsingErp(request.getUsingErp());
        if (request.getTransformationWillingness() != null) enterprise.setTransformationWillingness(request.getTransformationWillingness());
        if (request.getInvestmentWillingness() != null) enterprise.setInvestmentWillingness(request.getInvestmentWillingness());
        if (request.getCrossBorderPlatforms() != null) enterprise.setCrossBorderPlatforms(request.getCrossBorderPlatforms());
        if (request.getTargetMarkets() != null) enterprise.setTargetMarkets(request.getTargetMarkets());
        
        // 三中心评估
        if (request.getServiceCooperationRating() != null) enterprise.setServiceCooperationRating(request.getServiceCooperationRating());
        if (request.getInvestmentCooperationRating() != null) enterprise.setInvestmentCooperationRating(request.getInvestmentCooperationRating());
        if (request.getIncubationCooperationRating() != null) enterprise.setIncubationCooperationRating(request.getIncubationCooperationRating());
        if (request.getBrandCooperationRating() != null) enterprise.setBrandCooperationRating(request.getBrandCooperationRating());
        if (request.getTrainingCooperationRating() != null) enterprise.setTrainingCooperationRating(request.getTrainingCooperationRating());
        if (request.getOverallCooperationRating() != null) enterprise.setOverallCooperationRating(request.getOverallCooperationRating());
        if (request.getBenchmarkPossibility() != null) enterprise.setBenchmarkPossibility(request.getBenchmarkPossibility());
        if (request.getAdditionalNotes() != null) enterprise.setAdditionalNotes(request.getAdditionalNotes());
        
        // 政策支持
        if (request.getHasPolicySupport() != null) enterprise.setHasPolicySupport(request.getHasPolicySupport());
        if (request.getEnjoyedPolicies() != null) enterprise.setEnjoyedPolicies(request.getEnjoyedPolicies());
        if (request.getDesiredSupport() != null) enterprise.setDesiredSupport(request.getDesiredSupport());
        if (request.getCooperationDemands() != null) enterprise.setCooperationDemands(request.getCooperationDemands());
        
        // 竞争力信息
        if (request.getCompetitionPosition() != null) enterprise.setCompetitionPosition(request.getCompetitionPosition());
        if (request.getCompetitionDescription() != null) enterprise.setCompetitionDescription(request.getCompetitionDescription());
        if (request.getPainPoints() != null) enterprise.setPainPoints(request.getPainPoints());
        
        // 三中心合作
        if (request.getTricenterDemands() != null) enterprise.setTricenterDemands(request.getTricenterDemands());
        if (request.getTricenterConcerns() != null) enterprise.setTricenterConcerns(request.getTricenterConcerns());
        
        enterpriseMapper.updateById(enterprise);
        
        log.info("更新企业成功: id={}", id);
        
        return enterprise;
    }

    @Override
    @Transactional
    public void deleteEnterprise(Integer id) {
        Enterprise enterprise = enterpriseMapper.selectById(id);
        if (enterprise == null) {
            throw BusinessException.notFound("企业不存在");
        }
        
        // 使用 MyBatis-Plus 的逻辑删除
        enterpriseMapper.deleteById(id);
        
        log.info("删除企业成功: id={}", id);
    }

    @Override
    @Transactional
    public void changeStage(Integer id, StageChangeRequest request, Integer operatorId) {
        Enterprise enterprise = enterpriseMapper.selectById(id);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw BusinessException.notFound("企业不存在");
        }
        
        String oldStage = enterprise.getStage();
        String newStage = request.getStage();
        
        if (oldStage.equals(newStage)) {
            throw BusinessException.badRequest("目标阶段与当前阶段相同");
        }
        
        // 更新企业阶段
        enterprise.setStage(newStage);
        enterpriseMapper.updateById(enterprise);
        
        // 记录阶段变更日志
        StageChangeLog changeLog = new StageChangeLog();
        changeLog.setEnterpriseId(id);
        changeLog.setStageFrom(oldStage);
        changeLog.setStageTo(newStage);
        changeLog.setReason(request.getReason());
        changeLog.setOperatorId(operatorId);
        stageChangeLogMapper.insert(changeLog);
        
        log.info("企业阶段变更: id={}, {} -> {}", id, oldStage, newStage);
    }

    @Override
    @Transactional
    public List<EnterpriseContact> updateContacts(Integer enterpriseId, ContactUpdateRequest request) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw BusinessException.notFound("企业不存在");
        }
        
        // 删除原有联系人
        LambdaQueryWrapper<EnterpriseContact> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EnterpriseContact::getEnterpriseId, enterpriseId);
        contactMapper.delete(wrapper);
        
        // 新增联系人
        List<EnterpriseContact> contacts = new ArrayList<>();
        for (ContactUpdateRequest.ContactItem item : request.getContacts()) {
            EnterpriseContact contact = new EnterpriseContact();
            contact.setEnterpriseId(enterpriseId);
            contact.setName(item.getName());
            contact.setPhone(item.getPhone());
            contact.setPosition(item.getPosition());
            contact.setIsPrimary(Boolean.TRUE.equals(item.getIsPrimary()) ? 1 : 0);
            contact.setEmail(item.getEmail());
            contact.setWechat(item.getWechat());
            contact.setRemark(item.getRemark());
            contactMapper.insert(contact);
            contacts.add(contact);
        }
        
        log.info("更新企业联系人成功: enterpriseId={}, count={}", enterpriseId, contacts.size());
        
        return contacts;
    }

    @Override
    public List<EnterpriseContact> getContacts(Integer enterpriseId) {
        return contactMapper.selectByEnterpriseId(enterpriseId);
    }

    /**
     * 转换为列表响应对象
     */
    private EnterpriseListResponse convertToListResponse(Enterprise enterprise) {
        EnterpriseListResponse response = new EnterpriseListResponse();
        response.setId(enterprise.getId());
        response.setName(enterprise.getName());
        response.setDistrict(enterprise.getDistrict());
        response.setEnterpriseType(enterprise.getEnterpriseType());
        response.setStage(enterprise.getStage());
        response.setHasCrossBorder(enterprise.getHasCrossBorder());
        response.setCreatedAt(enterprise.getCreatedAt());
        
        // 获取行业名称
        if (enterprise.getIndustryId() != null) {
            IndustryCategory industry = industryCategoryMapper.selectById(enterprise.getIndustryId());
            if (industry != null) {
                response.setIndustryName(industry.getName());
            }
        }
        
        // 获取阶段信息
        SystemOption stageOption = getOptionByValue("stage", enterprise.getStage());
        if (stageOption != null) {
            response.setStageName(stageOption.getLabel());
            response.setStageColor(stageOption.getColor());
        }
        
        // 获取联系人列表
        List<EnterpriseContact> contacts = contactMapper.selectByEnterpriseId(enterprise.getId());
        if (contacts != null && !contacts.isEmpty()) {
            response.setContacts(contacts.stream().map(c -> {
                EnterpriseListResponse.ContactInfo info = new EnterpriseListResponse.ContactInfo();
                info.setName(c.getName());
                info.setPhone(c.getPhone());
                info.setIsPrimary(c.getIsPrimary() == 1);
                return info;
            }).collect(Collectors.toList()));
        }
        
        return response;
    }

    /**
     * 转换为详情响应对象
     */
    private EnterpriseDetailResponse convertToDetailResponse(Enterprise enterprise) {
        EnterpriseDetailResponse response = new EnterpriseDetailResponse();
        
        // 基本信息
        response.setId(enterprise.getId());
        response.setName(enterprise.getName());
        response.setCreditCode(enterprise.getCreditCode());
        response.setProvince(enterprise.getProvince());
        response.setCity(enterprise.getCity());
        response.setDistrict(enterprise.getDistrict());
        response.setAddress(enterprise.getAddress());
        response.setIndustryId(enterprise.getIndustryId());
        response.setEnterpriseType(enterprise.getEnterpriseType());
        response.setStaffSizeId(enterprise.getStaffSizeId());
        response.setWebsite(enterprise.getWebsite());
        response.setDomesticRevenueId(enterprise.getDomesticRevenueId());
        response.setCrossBorderRevenueId(enterprise.getCrossBorderRevenueId());
        response.setSourceId(enterprise.getSourceId());
        response.setStage(enterprise.getStage());
        // 获取关联名称
        if (enterprise.getIndustryId() != null) {
            IndustryCategory industry = industryCategoryMapper.selectById(enterprise.getIndustryId());
            if (industry != null) {
                response.setIndustryName(industry.getName());
            }
        }
        
        // 阶段信息
        SystemOption stageOption = getOptionByValue("stage", enterprise.getStage());
        if (stageOption != null) {
            response.setStageName(stageOption.getLabel());
            response.setStageColor(stageOption.getColor());
        }
        
        // 人员规模
        if (enterprise.getStaffSizeId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getStaffSizeId());
            if (option != null) {
                response.setStaffSizeLabel(option.getLabel());
            }
        }
        
        // 国内营收
        if (enterprise.getDomesticRevenueId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getDomesticRevenueId());
            if (option != null) {
                response.setDomesticRevenueLabel(option.getLabel());
            }
        }
        
        // 跨境营收
        if (enterprise.getCrossBorderRevenueId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getCrossBorderRevenueId());
            if (option != null) {
                response.setCrossBorderRevenueLabel(option.getLabel());
            }
        }
        
        // 企业来源
        if (enterprise.getSourceId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getSourceId());
            if (option != null) {
                response.setSourceLabel(option.getLabel());
            }
        }
        
        // 外贸模式
        if (enterprise.getTradeModeId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getTradeModeId());
            if (option != null) {
                response.setTradeModeLabel(option.getLabel());
            }
        }
        
        // 外贸团队模式
        if (enterprise.getTradeTeamModeId() != null) {
            SystemOption option = systemOptionMapper.selectById(enterprise.getTradeTeamModeId());
            if (option != null) {
                response.setTradeTeamModeLabel(option.getLabel());
            }
        }
        
        // 联系人列表
        List<EnterpriseContact> contacts = contactMapper.selectByEnterpriseId(enterprise.getId());
        if (contacts != null) {
            response.setContacts(contacts.stream().map(c -> {
                EnterpriseDetailResponse.ContactResponse cr = new EnterpriseDetailResponse.ContactResponse();
                cr.setId(c.getId());
                cr.setName(c.getName());
                cr.setPhone(c.getPhone());
                cr.setPosition(c.getPosition());
                cr.setIsPrimary(c.getIsPrimary() == 1);
                cr.setEmail(c.getEmail());
                cr.setWechat(c.getWechat());
                cr.setRemark(c.getRemark());
                return cr;
            }).collect(Collectors.toList()));
        }
        
        // 品牌信息
        response.setHasOwnBrand(enterprise.getHasOwnBrand() != null && enterprise.getHasOwnBrand() == 1);
        if (enterprise.getBrandNames() != null) {
            response.setBrandNames(Arrays.asList(enterprise.getBrandNames().split(",")));
        }
        
        // 外贸信息
        response.setTargetRegionIds(enterprise.getTargetRegionIds());
        response.setTargetCountryIds(enterprise.getTargetCountryIds());
        response.setTradeModeId(enterprise.getTradeModeId());
        response.setHasImportExportLicense(enterprise.getHasImportExportLicense() != null && enterprise.getHasImportExportLicense() == 1);
        response.setCustomsDeclarationMode(enterprise.getCustomsDeclarationMode());
        response.setTradeTeamModeId(enterprise.getTradeTeamModeId());
        response.setTradeTeamSize(enterprise.getTradeTeamSize());
        response.setHasDomesticEcommerce(enterprise.getHasDomesticEcommerce() != null && enterprise.getHasDomesticEcommerce() == 1);
        
        // 外贸业绩
        response.setLastYearRevenue(enterprise.getLastYearRevenue());
        response.setYearBeforeLastRevenue(enterprise.getYearBeforeLastRevenue());
        response.setMarketChanges(enterprise.getMarketChanges());
        response.setModeChanges(enterprise.getModeChanges());
        response.setCategoryChanges(enterprise.getCategoryChanges());
        response.setGrowthReasons(enterprise.getGrowthReasons());
        response.setDeclineReasons(enterprise.getDeclineReasons());
        
        // 跨境电商信息
        response.setHasCrossBorder(enterprise.getHasCrossBorder() != null && enterprise.getHasCrossBorder() == 1);
        response.setCrossBorderRatio(enterprise.getCrossBorderRatio());
        response.setCrossBorderLogistics(enterprise.getCrossBorderLogistics());
        response.setPaymentSettlement(enterprise.getPaymentSettlement());
        response.setCrossBorderTeamSize(enterprise.getCrossBorderTeamSize());
        response.setUsingErp(enterprise.getUsingErp() != null && enterprise.getUsingErp() == 1);
        response.setTransformationWillingness(enterprise.getTransformationWillingness());
        response.setInvestmentWillingness(enterprise.getInvestmentWillingness());
        response.setCrossBorderPlatforms(enterprise.getCrossBorderPlatforms());
        response.setTargetMarkets(enterprise.getTargetMarkets());
        
        // 三中心评估
        response.setServiceCooperationRating(enterprise.getServiceCooperationRating());
        response.setInvestmentCooperationRating(enterprise.getInvestmentCooperationRating());
        response.setIncubationCooperationRating(enterprise.getIncubationCooperationRating());
        response.setBrandCooperationRating(enterprise.getBrandCooperationRating());
        response.setTrainingCooperationRating(enterprise.getTrainingCooperationRating());
        response.setOverallCooperationRating(enterprise.getOverallCooperationRating());
        response.setBenchmarkPossibility(enterprise.getBenchmarkPossibility());
        response.setAdditionalNotes(enterprise.getAdditionalNotes());
        
        // 政策支持
        response.setHasPolicySupport(enterprise.getHasPolicySupport() != null && enterprise.getHasPolicySupport() == 1);
        response.setEnjoyedPolicies(enterprise.getEnjoyedPolicies());
        response.setDesiredSupport(enterprise.getDesiredSupport());
        response.setCooperationDemands(enterprise.getCooperationDemands());
        
        // 竞争力信息
        response.setCompetitionPosition(enterprise.getCompetitionPosition());
        response.setCompetitionDescription(enterprise.getCompetitionDescription());
        response.setPainPoints(enterprise.getPainPoints());
        
        // 三中心合作
        response.setTricenterDemands(enterprise.getTricenterDemands());
        response.setTricenterConcerns(enterprise.getTricenterConcerns());
        
        // 产品列表
        LambdaQueryWrapper<EnterpriseProduct> productWrapper = new LambdaQueryWrapper<>();
        productWrapper.eq(EnterpriseProduct::getEnterpriseId, enterprise.getId());
        List<EnterpriseProduct> products = productMapper.selectList(productWrapper);
        if (products != null && !products.isEmpty()) {
            response.setProducts(products.stream().map(p -> {
                EnterpriseDetailResponse.ProductInfo info = new EnterpriseDetailResponse.ProductInfo();
                info.setId(p.getId());
                info.setName(p.getName());
                info.setCategoryId(p.getCategoryId());
                info.setCertificationIds(p.getCertificationIds());
                info.setTargetRegionIds(p.getTargetRegionIds());
                info.setTargetCountryIds(p.getTargetCountryIds());
                info.setAnnualSales(p.getAnnualSales());
                info.setLocalProcurementRatio(p.getLocalProcurementRatio());
                info.setAutomationLevelId(p.getAutomationLevelId());
                info.setAnnualCapacity(p.getAnnualCapacity());
                info.setLogisticsPartnerIds(p.getLogisticsPartnerIds());
                
                // 获取产品品类名称
                if (p.getCategoryId() != null) {
                    ProductCategory category = productCategoryMapper.selectById(p.getCategoryId());
                    if (category != null) {
                        info.setCategoryName(category.getName());
                    }
                }
                
                // 获取认证标签名称
                if (p.getCertificationIds() != null && !p.getCertificationIds().isEmpty()) {
                    List<String> certNames = new ArrayList<>();
                    for (Integer certId : p.getCertificationIds()) {
                        SystemOption opt = systemOptionMapper.selectById(certId);
                        if (opt != null) certNames.add(opt.getLabel());
                    }
                    info.setCertificationNames(certNames);
                }
                
                // 获取销售区域名称
                if (p.getTargetRegionIds() != null && !p.getTargetRegionIds().isEmpty()) {
                    List<String> regionNames = new ArrayList<>();
                    for (Integer regionId : p.getTargetRegionIds()) {
                        SystemOption opt = systemOptionMapper.selectById(regionId);
                        if (opt != null) regionNames.add(opt.getLabel());
                    }
                    info.setTargetRegionNames(regionNames);
                }
                
                // 获取自动化程度名称
                if (p.getAutomationLevelId() != null) {
                    SystemOption opt = systemOptionMapper.selectById(p.getAutomationLevelId());
                    if (opt != null) info.setAutomationLevelName(opt.getLabel());
                }
                
                // 获取物流合作方名称
                if (p.getLogisticsPartnerIds() != null && !p.getLogisticsPartnerIds().isEmpty()) {
                    List<String> partnerNames = new ArrayList<>();
                    for (Integer partnerId : p.getLogisticsPartnerIds()) {
                        SystemOption opt = systemOptionMapper.selectById(partnerId);
                        if (opt != null) partnerNames.add(opt.getLabel());
                    }
                    info.setLogisticsPartnerNames(partnerNames);
                }
                
                return info;
            }).collect(Collectors.toList()));
        }
        
        // 专利列表
        LambdaQueryWrapper<EnterprisePatent> patentWrapper = new LambdaQueryWrapper<>();
        patentWrapper.eq(EnterprisePatent::getEnterpriseId, enterprise.getId());
        List<EnterprisePatent> patents = patentMapper.selectList(patentWrapper);
        if (patents != null && !patents.isEmpty()) {
            response.setPatents(patents.stream().map(p -> {
                EnterpriseDetailResponse.PatentInfo info = new EnterpriseDetailResponse.PatentInfo();
                info.setId(p.getId());
                info.setName(p.getName());
                info.setPatentNo(p.getPatentNo());
                return info;
            }).collect(Collectors.toList()));
        }
        
        // 时间戳
        response.setCreatedAt(enterprise.getCreatedAt());
        response.setUpdatedAt(enterprise.getUpdatedAt());
        
        return response;
    }

    /**
     * 根据分类和值获取系统选项
     */
    private SystemOption getOptionByValue(String category, String value) {
        if (value == null) return null;
        LambdaQueryWrapper<SystemOption> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SystemOption::getCategory, category)
               .eq(SystemOption::getValue, value);
        return systemOptionMapper.selectOne(wrapper);
    }

    @Override
    public ImportResultResponse importEnterprises(MultipartFile file) {
        List<ImportResultResponse.ErrorDetail> errors = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;
        
        try {
            List<EnterpriseExcelData> dataList = EasyExcel.read(file.getInputStream())
                    .head(EnterpriseExcelData.class)
                    .sheet()
                    .doReadSync();
            
            for (int i = 0; i < dataList.size(); i++) {
                int rowNum = i + 2; // Excel行号从2开始（第1行是表头）
                EnterpriseExcelData data = dataList.get(i);
                
                try {
                    // 验证必填字段
                    if (!StringUtils.hasText(data.getName())) {
                        throw new RuntimeException("企业名称不能为空");
                    }
                    if (!StringUtils.hasText(data.getDistrict())) {
                        throw new RuntimeException("所属区域不能为空");
                    }
                    if (!StringUtils.hasText(data.getEnterpriseType())) {
                        throw new RuntimeException("企业类型不能为空");
                    }
                    
                    // 检查企业名称是否重复
                    LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
                    wrapper.eq(Enterprise::getName, data.getName())
                           .eq(Enterprise::getIsDeleted, 0);
                    if (enterpriseMapper.selectCount(wrapper) > 0) {
                        throw new RuntimeException("企业名称已存在");
                    }
                    
                    // 创建企业
                    Enterprise enterprise = new Enterprise();
                    enterprise.setName(data.getName());
                    enterprise.setCreditCode(data.getCreditCode());
                    enterprise.setDistrict(data.getDistrict());
                    enterprise.setAddress(data.getAddress());
                    enterprise.setEnterpriseType(data.getEnterpriseType());
                    enterprise.setWebsite(data.getWebsite());
                    enterprise.setStage("POTENTIAL");
                    enterprise.setIsDeleted(0);
                    
                    // 处理是否跨境
                    if ("是".equals(data.getHasCrossBorder())) {
                        enterprise.setHasCrossBorder(1);
                    } else {
                        enterprise.setHasCrossBorder(0);
                    }
                    
                    enterpriseMapper.insert(enterprise);
                    
                    // 创建联系人
                    if (StringUtils.hasText(data.getContactName())) {
                        EnterpriseContact contact = new EnterpriseContact();
                        contact.setEnterpriseId(enterprise.getId());
                        contact.setName(data.getContactName());
                        contact.setPhone(data.getContactPhone());
                        contact.setPosition(data.getContactPosition());
                        contact.setIsPrimary(1);
                        contactMapper.insert(contact);
                    }
                    
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add(ImportResultResponse.ErrorDetail.builder()
                            .row(rowNum)
                            .message(e.getMessage())
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("导入企业失败", e);
            throw BusinessException.badRequest("文件解析失败: " + e.getMessage());
        }
        
        log.info("导入企业完成: success={}, failed={}", successCount, failCount);
        
        return ImportResultResponse.builder()
                .success(successCount)
                .failed(failCount)
                .errors(errors)
                .build();
    }

    @Override
    public void exportEnterprises(EnterpriseQueryRequest request, HttpServletResponse response) {
        // 查询数据
        request.setPage(1);
        request.setPageSize(10000); // 最多导出1万条
        PageResult<EnterpriseListResponse> result = getEnterpriseList(request);
        
        // 转换为Excel数据
        List<EnterpriseExcelData> excelDataList = result.getList().stream().map(e -> {
            EnterpriseExcelData data = new EnterpriseExcelData();
            data.setName(e.getName());
            data.setDistrict(e.getDistrict());
            data.setIndustryName(e.getIndustryName());
            data.setEnterpriseType(e.getEnterpriseType());
            data.setStageName(e.getStageName());
            data.setHasCrossBorder(e.getHasCrossBorder() != null && e.getHasCrossBorder() == 1 ? "是" : "否");
            
            // 联系人信息
            if (e.getContacts() != null && !e.getContacts().isEmpty()) {
                EnterpriseListResponse.ContactInfo primary = e.getContacts().stream()
                        .filter(c -> Boolean.TRUE.equals(c.getIsPrimary()))
                        .findFirst()
                        .orElse(e.getContacts().get(0));
                data.setContactName(primary.getName());
                data.setContactPhone(primary.getPhone());
            }
            
            return data;
        }).collect(Collectors.toList());
        
        // 导出Excel
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("企业列表", "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
            
            EasyExcel.write(response.getOutputStream(), EnterpriseExcelData.class)
                    .sheet("企业列表")
                    .doWrite(excelDataList);
        } catch (Exception e) {
            log.error("导出企业失败", e);
            throw new BusinessException("导出失败: " + e.getMessage());
        }
    }

    @Override
    public void downloadTemplate(HttpServletResponse response) {
        // 创建示例数据
        List<EnterpriseExcelData> templateData = new ArrayList<>();
        EnterpriseExcelData example = new EnterpriseExcelData();
        example.setName("示例企业名称");
        example.setCreditCode("91320000000000000X");
        example.setDistrict("新北区");
        example.setAddress("常州市新北区XX路XX号");
        example.setEnterpriseType("生产型");
        example.setWebsite("https://example.com");
        example.setContactName("张三");
        example.setContactPhone("13800138000");
        example.setContactPosition("总经理");
        example.setHasCrossBorder("否");
        templateData.add(example);
        
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("企业导入模板", "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
            
            EasyExcel.write(response.getOutputStream(), EnterpriseExcelData.class)
                    .sheet("企业导入模板")
                    .doWrite(templateData);
        } catch (Exception e) {
            log.error("下载模板失败", e);
            throw new BusinessException("下载失败: " + e.getMessage());
        }
    }
}
