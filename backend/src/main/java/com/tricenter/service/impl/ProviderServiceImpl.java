package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.ProviderCreateRequest;
import com.tricenter.dto.request.ProviderQueryRequest;
import com.tricenter.dto.request.ProviderUpdateRequest;
import com.tricenter.dto.response.ProviderDetailResponse;
import com.tricenter.dto.response.ProviderListResponse;
import com.tricenter.entity.Provider;
import com.tricenter.entity.ProviderContact;
import com.tricenter.entity.ProviderServiceArea;
import com.tricenter.mapper.EnterpriseServiceRecordMapper;
import com.tricenter.mapper.ProviderContactMapper;
import com.tricenter.mapper.ProviderMapper;
import com.tricenter.mapper.ProviderServiceAreaMapper;
import com.tricenter.service.OptionsService;
import com.tricenter.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 服务商服务实现
 */
@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private static final String DEFAULT_COMPATIBILITY_CATEGORY = "others";
    private static final String DEFAULT_PROVIDER_NAME = "未命名服务商";
    private static final ProviderServiceStats EMPTY_PROVIDER_STATS = new ProviderServiceStats(0, 0);

    private final ProviderMapper providerMapper;
    private final ProviderContactMapper providerContactMapper;
    private final ProviderServiceAreaMapper providerServiceAreaMapper;
    private final EnterpriseServiceRecordMapper enterpriseServiceRecordMapper;
    private final OptionsService optionsService;

    @Override
    public PageResult<ProviderListResponse> getProviderList(ProviderQueryRequest request) {
        LambdaQueryWrapper<Provider> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(request.getKeyword())) {
            wrapper.like(Provider::getName, request.getKeyword());
        }
        if (StringUtils.hasText(request.getCategory())) {
            wrapper.eq(Provider::getCategory, request.getCategory());
        }
        if (StringUtils.hasText(request.getCooperationStatus())) {
            wrapper.eq(Provider::getCooperationStatus, request.getCooperationStatus());
        }
        if (StringUtils.hasText(request.getDistrict())) {
            wrapper.eq(Provider::getDistrict, request.getDistrict());
        }

        wrapper.orderByDesc(Provider::getCreatedAt);

        Page<Provider> page = new Page<>(request.getPage(), request.getPageSize());
        providerMapper.selectPage(page, wrapper);

        // 获取分类名称映射
        Map<String, String> categoryMap = buildCategoryMap();

        // 批量查询主要联系人
        List<Integer> providerIds = page.getRecords().stream()
                .map(Provider::getId).collect(Collectors.toList());

        Map<Integer, ProviderContact> primaryContactMap = Map.of();
        if (!providerIds.isEmpty()) {
            LambdaQueryWrapper<ProviderContact> contactWrapper = new LambdaQueryWrapper<>();
            contactWrapper.in(ProviderContact::getProviderId, providerIds)
                    .eq(ProviderContact::getIsPrimary, 1);
            List<ProviderContact> contacts = providerContactMapper.selectList(contactWrapper);
            primaryContactMap = contacts.stream()
                    .collect(Collectors.toMap(ProviderContact::getProviderId, c -> c, (a, b) -> a));
        }

        Map<Integer, ProviderServiceStats> providerStatsMap = loadProviderStatsMap(providerIds);
        Map<Integer, ProviderContact> finalPrimaryContactMap = primaryContactMap;
        Map<Integer, ProviderServiceStats> finalProviderStatsMap = providerStatsMap;
        List<ProviderListResponse> list = page.getRecords().stream().map(p -> {
            ProviderServiceStats stats = finalProviderStatsMap.getOrDefault(p.getId(), EMPTY_PROVIDER_STATS);
            ProviderListResponse resp = new ProviderListResponse();
            resp.setId(p.getId());
            resp.setName(p.getName());
            resp.setCategory(p.getCategory());
            resp.setCategoryName(categoryMap.getOrDefault(p.getCategory(), p.getCategory()));
            resp.setDistrict(p.getDistrict());
            resp.setCooperationStatus(p.getCooperationStatus());
            resp.setCooperationStartDate(p.getCooperationStartDate());
            resp.setContractEndDate(p.getContractEndDate());
            resp.setServiceRating(p.getServiceRating());
            resp.setTotalServiceCount(stats.totalServiceCount());
            resp.setTotalServedEnterprises(stats.totalServedEnterprises());
            resp.setCapabilityRequirementIds(p.getCapabilityRequirementIds());
            resp.setCreatedAt(p.getCreatedAt());

            ProviderContact contact = finalPrimaryContactMap.get(p.getId());
            if (contact != null) {
                resp.setPrimaryContactName(contact.getName());
                resp.setPrimaryContactPhone(contact.getPhone());
            }
            return resp;
        }).collect(Collectors.toList());

        return PageResult.of(list, page.getTotal(), request.getPage(), request.getPageSize());
    }

    @Override
    public ProviderDetailResponse getProviderDetail(Integer id) {
        Provider provider = providerMapper.selectById(id);
        if (provider == null) {
            throw new RuntimeException("服务商不存在");
        }

        ProviderServiceStats stats = loadProviderStatsMap(List.of(id)).getOrDefault(id, EMPTY_PROVIDER_STATS);

        ProviderDetailResponse resp = new ProviderDetailResponse();
        resp.setId(provider.getId());
        resp.setName(provider.getName());
        resp.setCategory(provider.getCategory());
        resp.setDescription(provider.getDescription());
        resp.setCreditCode(provider.getCreditCode());
        resp.setProvince(provider.getProvince());
        resp.setCity(provider.getCity());
        resp.setDistrict(provider.getDistrict());
        resp.setAddress(provider.getAddress());
        resp.setWebsite(provider.getWebsite());
        resp.setServiceScope(provider.getServiceScope());
        resp.setServiceTags(provider.getServiceTags());
        resp.setStaffSizeId(provider.getStaffSizeId());
        resp.setQualification(provider.getQualification());
        resp.setCapabilityRequirementIds(provider.getCapabilityRequirementIds());
        resp.setCooperationStartDate(provider.getCooperationStartDate());
        resp.setCooperationStatus(provider.getCooperationStatus());
        resp.setContractEndDate(provider.getContractEndDate());
        resp.setServiceRating(provider.getServiceRating());
        resp.setTotalServiceCount(stats.totalServiceCount());
        resp.setTotalServedEnterprises(stats.totalServedEnterprises());
        resp.setBookingProviderId(provider.getBookingProviderId());
        resp.setCreatedAt(provider.getCreatedAt());
        resp.setUpdatedAt(provider.getUpdatedAt());

        // 联系人列表
        LambdaQueryWrapper<ProviderContact> contactWrapper = new LambdaQueryWrapper<>();
        contactWrapper.eq(ProviderContact::getProviderId, id)
                .orderByDesc(ProviderContact::getIsPrimary)
                .orderByAsc(ProviderContact::getId);
        List<ProviderContact> contacts = providerContactMapper.selectList(contactWrapper);
        resp.setContacts(contacts.stream().map(c -> {
            ProviderDetailResponse.ContactInfo info = new ProviderDetailResponse.ContactInfo();
            info.setId(c.getId());
            info.setName(c.getName());
            info.setPhone(c.getPhone());
            info.setPosition(c.getPosition());
            info.setIsPrimary(c.getIsPrimary());
            info.setEmail(c.getEmail());
            info.setWechat(c.getWechat());
            info.setRemark(c.getRemark());
            return info;
        }).collect(Collectors.toList()));

        // 服务领域列表
        LambdaQueryWrapper<ProviderServiceArea> areaWrapper = new LambdaQueryWrapper<>();
        areaWrapper.eq(ProviderServiceArea::getProviderId, id)
                .orderByAsc(ProviderServiceArea::getSortOrder);
        List<ProviderServiceArea> areas = providerServiceAreaMapper.selectList(areaWrapper);
        resp.setServiceAreas(areas.stream().map(a -> {
            ProviderDetailResponse.ServiceAreaInfo info = new ProviderDetailResponse.ServiceAreaInfo();
            info.setId(a.getId());
            info.setAreaName(a.getAreaName());
            info.setDescription(a.getDescription());
            info.setSortOrder(a.getSortOrder());
            return info;
        }).collect(Collectors.toList()));

        return resp;
    }

    @Override
    @Transactional
    public Provider createProvider(ProviderCreateRequest request) {
        Provider provider = new Provider();
        provider.setName(StringUtils.hasText(request.getName()) ? request.getName().trim() : DEFAULT_PROVIDER_NAME);
        provider.setCategory(resolveCompatibleCategory(request.getCategory(), null));
        provider.setDescription(request.getDescription());
        provider.setCreditCode(request.getCreditCode());
        provider.setProvince(request.getProvince());
        provider.setCity(request.getCity());
        provider.setDistrict(request.getDistrict());
        provider.setAddress(request.getAddress());
        provider.setWebsite(request.getWebsite());
        provider.setServiceScope(request.getServiceScope());
        provider.setServiceTags(request.getServiceTags());
        provider.setStaffSizeId(request.getStaffSizeId());
        provider.setQualification(request.getQualification());
        provider.setCapabilityRequirementIds(request.getCapabilityRequirementIds());
        provider.setCooperationStartDate(request.getCooperationStartDate());
        provider.setCooperationStatus(request.getCooperationStatus());
        provider.setContractEndDate(request.getContractEndDate());

        providerMapper.insert(provider);

        // 创建主要联系人
        if (request.getPrimaryContact() != null) {
            ProviderCreateRequest.ContactInfo ci = request.getPrimaryContact();
            ProviderContact contact = new ProviderContact();
            contact.setProviderId(provider.getId());
            contact.setName(ci.getName());
            contact.setPhone(ci.getPhone());
            contact.setPosition(ci.getPosition());
            contact.setEmail(ci.getEmail());
            contact.setWechat(ci.getWechat());
            contact.setRemark(ci.getRemark());
            contact.setIsPrimary(1);
            providerContactMapper.insert(contact);
        }

        return provider;
    }

    @Override
    @Transactional
    public Provider updateProvider(Integer id, ProviderUpdateRequest request) {
        Provider provider = providerMapper.selectById(id);
        if (provider == null) {
            throw new RuntimeException("服务商不存在");
        }

        provider.setName(request.getName());
        provider.setCategory(resolveCompatibleCategory(request.getCategory(), provider.getCategory()));
        provider.setDescription(request.getDescription());
        provider.setCreditCode(request.getCreditCode());
        provider.setProvince(request.getProvince());
        provider.setCity(request.getCity());
        provider.setDistrict(request.getDistrict());
        provider.setAddress(request.getAddress());
        provider.setWebsite(request.getWebsite());
        provider.setServiceScope(request.getServiceScope());
        provider.setServiceTags(request.getServiceTags());
        provider.setStaffSizeId(request.getStaffSizeId());
        provider.setQualification(request.getQualification());
        provider.setCapabilityRequirementIds(request.getCapabilityRequirementIds());
        provider.setCooperationStartDate(request.getCooperationStartDate());
        provider.setCooperationStatus(request.getCooperationStatus());
        provider.setContractEndDate(request.getContractEndDate());

        providerMapper.updateById(provider);

        if (request.getContacts() != null) {
            replaceProviderContacts(id, request.getContacts());
        }

        return provider;
    }

    @Override
    public void deleteProvider(Integer id) {
        Provider provider = providerMapper.selectById(id);
        if (provider == null) {
            throw new RuntimeException("服务商不存在");
        }
        providerMapper.deleteById(id);
    }

    private Map<Integer, ProviderServiceStats> loadProviderStatsMap(List<Integer> providerIds) {
        if (providerIds == null || providerIds.isEmpty()) {
            return Map.of();
        }

        return enterpriseServiceRecordMapper.selectProviderStats(providerIds).stream()
                .collect(Collectors.toMap(
                        row -> toInt(row.get("providerId")),
                        row -> new ProviderServiceStats(
                                toInt(row.get("totalServiceCount")),
                                toInt(row.get("totalServedEnterprises"))
                        )
                ));
    }

    private String resolveCompatibleCategory(String requestedCategory, String currentCategory) {
        if (StringUtils.hasText(requestedCategory)) {
            return requestedCategory;
        }
        if (StringUtils.hasText(currentCategory)) {
            return currentCategory;
        }
        return DEFAULT_COMPATIBILITY_CATEGORY;
    }

    private Integer toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return 0;
    }

    private Map<String, String> buildCategoryMap() {
        try {
            return optionsService.getOptionsByCategory("provider_category").stream()
                    .collect(Collectors.toMap(
                            o -> o.getValue() != null ? o.getValue() : String.valueOf(o.getId()),
                            o -> o.getLabel(),
                            (a, b) -> a
                    ));
        } catch (Exception e) {
            return Map.of();
        }
    }

    private record ProviderServiceStats(int totalServiceCount, int totalServedEnterprises) {
    }

    private void replaceProviderContacts(Integer providerId, List<ProviderUpdateRequest.ContactInfo> contacts) {
        LambdaQueryWrapper<ProviderContact> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(ProviderContact::getProviderId, providerId);
        providerContactMapper.delete(deleteWrapper);

        List<ProviderUpdateRequest.ContactInfo> validContacts = new ArrayList<>();
        for (ProviderUpdateRequest.ContactInfo contactInfo : contacts) {
            if (contactInfo == null) {
                continue;
            }
            if (!StringUtils.hasText(contactInfo.getName()) || !StringUtils.hasText(contactInfo.getPhone())) {
                continue;
            }
            validContacts.add(contactInfo);
        }

        boolean hasPrimary = validContacts.stream().anyMatch(contact -> Boolean.TRUE.equals(contact.getIsPrimary()));

        for (int i = 0; i < validContacts.size(); i++) {
            ProviderUpdateRequest.ContactInfo ci = validContacts.get(i);
            ProviderContact contact = new ProviderContact();
            contact.setProviderId(providerId);
            contact.setName(ci.getName().trim());
            contact.setPhone(ci.getPhone().trim());
            contact.setPosition(ci.getPosition());
            contact.setEmail(ci.getEmail());
            contact.setWechat(ci.getWechat());
            contact.setRemark(ci.getRemark());
            contact.setIsPrimary(Boolean.TRUE.equals(ci.getIsPrimary()) || (!hasPrimary && i == 0) ? 1 : 0);
            providerContactMapper.insert(contact);
        }
    }
}
