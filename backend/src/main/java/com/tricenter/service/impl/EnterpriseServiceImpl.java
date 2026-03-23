package com.tricenter.service.impl;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.common.result.PageResult;
import com.tricenter.dto.excel.EnterpriseExcelData;
import com.tricenter.dto.request.*;
import com.tricenter.dto.response.AnalysisStatsResponse;
import com.tricenter.dto.response.EnterpriseDetailResponse;
import com.tricenter.dto.response.EnterpriseListResponse;
import com.tricenter.dto.response.EnterpriseOverviewStatsResponse;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.entity.*;
import com.tricenter.mapper.*;
import com.tricenter.service.DashboardService;
import com.tricenter.service.DictionaryCacheService;
import com.tricenter.service.EnterpriseService;
import com.tricenter.service.OptionsService;
import com.tricenter.service.RequirementMatchEngine;
import com.tricenter.util.EnterpriseExportListSheetPoi;
import com.tricenter.util.EnterpriseExportRequirementMatrixSheet;
import com.tricenter.util.StageCodeUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 企业服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnterpriseServiceImpl implements EnterpriseService {

    /** 数据分析漏斗图固定顺序（code, 中文名） */
    private static final String[][] FUNNEL_STAGE_DEFS = {
            {"POTENTIAL", "潜在企业"}, {"NO_DEMAND", "无明确需求"},
            {"NO_INTENTION", "没有合作意向"}, {"HAS_DEMAND", "有明确需求"},
            {"SIGNED", "已签约"}, {"SETTLED", "已入驻"}, {"INCUBATING", "重点孵化"}
    };

    private final EnterpriseMapper enterpriseMapper;
    private final EnterpriseContactMapper contactMapper;
    private final EnterpriseProductMapper productMapper;
    private final EnterprisePatentMapper patentMapper;
    private final ProductCategoryMapper productCategoryMapper;
    private final StageChangeLogMapper stageChangeLogMapper;
    private final FollowUpRecordMapper followUpRecordMapper;
    private final DashboardService dashboardService;
    private final DictionaryCacheService dictionaryCache;
    private final RequirementMatchEngine requirementMatchEngine;
    private final OptionsService optionsService;

    @Override
    public PageResult<EnterpriseListResponse> getEnterpriseList(EnterpriseQueryRequest request) {
        Set<Integer> matchedIds = resolveExternalFilters(request);
        if (matchedIds != null && matchedIds.isEmpty()) {
            return PageResult.of(Collections.emptyList(), 0, request.getPage(), request.getPageSize());
        }

        LambdaQueryWrapper<Enterprise> wrapper = buildFilterWrapper(request, matchedIds);
        wrapper.select(
                Enterprise::getId, Enterprise::getName, Enterprise::getDistrict,
                Enterprise::getIndustryId, Enterprise::getEnterpriseType,
                Enterprise::getStage, Enterprise::getHasCrossBorder, Enterprise::getCreatedAt
        );
        wrapper.orderByDesc(Enterprise::getCreatedAt);

        Page<Enterprise> page = new Page<>(request.getPage(), request.getPageSize());
        Page<Enterprise> result = enterpriseMapper.selectPage(page, wrapper);
        List<EnterpriseListResponse> list = batchConvertToListResponse(result.getRecords());
        return PageResult.of(list, result.getTotal(), request.getPage(), request.getPageSize());
    }

    @Override
    public AnalysisStatsResponse getAnalysisStats(EnterpriseQueryRequest request) {
        Set<Integer> matchedIds = resolveExternalFilters(request);
        if (matchedIds != null && matchedIds.isEmpty()) {
            AnalysisStatsResponse empty = new AnalysisStatsResponse();
            empty.setTotalCount(0);
            empty.setDistrictStats(Collections.emptyList());
            empty.setTypeStats(Collections.emptyList());
            empty.setPlatformStats(Collections.emptyList());
            empty.setMarketStats(Collections.emptyList());
            empty.setIndustryStats(buildFullIndustryStats(Collections.emptyMap()));
            empty.setFunnelStats(toFunnelItems(Collections.emptyMap()));
            return empty;
        }

        LambdaQueryWrapper<Enterprise> wrapper = buildFilterWrapper(request, matchedIds);
        wrapper.select(
                Enterprise::getDistrict, Enterprise::getEnterpriseType,
                Enterprise::getCrossBorderPlatforms, Enterprise::getTargetMarkets,
                Enterprise::getIndustryId, Enterprise::getStage
        );
        List<Enterprise> enterprises = enterpriseMapper.selectList(wrapper);

        AnalysisStatsResponse response = new AnalysisStatsResponse();
        response.setTotalCount(enterprises.size());

        Map<String, Integer> districtMap = new LinkedHashMap<>();
        Map<String, Integer> typeMap = new LinkedHashMap<>();
        Map<String, Integer> platformMap = new LinkedHashMap<>();
        Map<String, Integer> marketMap = new LinkedHashMap<>();
        Map<String, Integer> industryMap = new LinkedHashMap<>();
        Map<String, Integer> stageMap = new LinkedHashMap<>();

        for (Enterprise e : enterprises) {
            if (StringUtils.hasText(e.getDistrict())) {
                districtMap.merge(e.getDistrict(), 1, Integer::sum);
            }
            String type = StringUtils.hasText(e.getEnterpriseType()) ? e.getEnterpriseType() : "未分类";
            typeMap.merge(type, 1, Integer::sum);
            aggregateMultiValueField(e.getCrossBorderPlatforms(), platformMap);
            aggregateMultiValueField(e.getTargetMarkets(), marketMap);

            String industryName = dictionaryCache.resolveLevel1IndustryName(e.getIndustryId());
            industryMap.merge(industryName, 1, Integer::sum);

            String stage = StageCodeUtil.normalize(e.getStage());
            stageMap.merge(stage, 1, Integer::sum);
        }

        response.setDistrictStats(toSortedNameCountList(districtMap));
        response.setTypeStats(toSortedNameCountList(typeMap));
        response.setPlatformStats(toSortedNameCountList(platformMap));
        response.setMarketStats(toSortedNameCountList(marketMap));
        response.setIndustryStats(buildFullIndustryStats(industryMap));

        response.setFunnelStats(toFunnelItems(stageMap));

        return response;
    }

    private List<AnalysisStatsResponse.FunnelItem> toFunnelItems(Map<String, Integer> stageMap) {
        List<AnalysisStatsResponse.FunnelItem> funnelList = new ArrayList<>();
        for (String[] s : FUNNEL_STAGE_DEFS) {
            funnelList.add(new AnalysisStatsResponse.FunnelItem(s[0], s[1], stageMap.getOrDefault(s[0], 0)));
        }
        return funnelList;
    }

    @Override
    public EnterpriseOverviewStatsResponse getOverviewStats(EnterpriseQueryRequest request) {
        EnterpriseOverviewStatsResponse out = new EnterpriseOverviewStatsResponse();
        Set<Integer> matchedIds = resolveExternalFilters(request);
        if (matchedIds != null && matchedIds.isEmpty()) {
            out.setTotalCount(0);
            out.setHasDemandCount(0);
            out.setSignedCount(0);
            out.setTotalExportRevenueWan(BigDecimal.ZERO);
            out.setOfflineExportRevenueWan(BigDecimal.ZERO);
            out.setOnlineCrossBorderExportRevenueWan(BigDecimal.ZERO);
            return out;
        }

        LambdaQueryWrapper<Enterprise> base = buildFilterWrapper(request, matchedIds);
        out.setTotalCount(enterpriseMapper.selectCount(base));

        LambdaQueryWrapper<Enterprise> demandWrapper = buildFilterWrapper(request, matchedIds);
        demandWrapper.in(Enterprise::getStage, StageCodeUtil.variantsForDbMatch("HAS_DEMAND"));
        out.setHasDemandCount(enterpriseMapper.selectCount(demandWrapper));

        LambdaQueryWrapper<Enterprise> signedWrapper = buildFilterWrapper(request, matchedIds);
        signedWrapper.in(Enterprise::getStage, StageCodeUtil.variantsForDbMatch("SIGNED"));
        out.setSignedCount(enterpriseMapper.selectCount(signedWrapper));

        LambdaQueryWrapper<Enterprise> revenueWrapper = buildFilterWrapper(request, matchedIds);
        revenueWrapper.select(Enterprise::getLastYearRevenue, Enterprise::getHasCrossBorder);
        List<Enterprise> revenueRows = enterpriseMapper.selectList(revenueWrapper);
        BigDecimal totalRev = BigDecimal.ZERO;
        BigDecimal offlineRev = BigDecimal.ZERO;
        BigDecimal onlineRev = BigDecimal.ZERO;
        for (Enterprise e : revenueRows) {
            BigDecimal r = e.getLastYearRevenue();
            if (r == null) {
                continue;
            }
            totalRev = totalRev.add(r);
            if (e.getHasCrossBorder() != null && e.getHasCrossBorder() == 1) {
                onlineRev = onlineRev.add(r);
            } else {
                offlineRev = offlineRev.add(r);
            }
        }
        out.setTotalExportRevenueWan(totalRev);
        out.setOfflineExportRevenueWan(offlineRev);
        out.setOnlineCrossBorderExportRevenueWan(onlineRev);
        return out;
    }

    /**
     * 解析外部表筛选条件（产品/跟进/需求），返回匹配的企业ID集合
     */
    private Set<Integer> resolveExternalFilters(EnterpriseQueryRequest request) {
        Set<Integer> matchedIds = null;
        matchedIds = mergeMatchedEnterpriseIds(matchedIds, findEnterpriseIdsByProductFilters(request));
        matchedIds = mergeMatchedEnterpriseIds(matchedIds, findEnterpriseIdsByLastFollowup(request.getLastFollowupDays()));
        matchedIds = mergeMatchedEnterpriseIds(matchedIds, findEnterpriseIdsByRequirements(request.getRequirementIds()));
        return matchedIds;
    }

    /**
     * 构建企业表通用筛选条件（列表和统计共享）
     */
    private LambdaQueryWrapper<Enterprise> buildFilterWrapper(EnterpriseQueryRequest request, Set<Integer> matchedIds) {
        LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Enterprise::getIsDeleted, 0);

        if (matchedIds != null) {
            wrapper.in(Enterprise::getId, matchedIds);
        }
        if (StringUtils.hasText(request.getKeyword())) wrapper.like(Enterprise::getName, request.getKeyword());
        if (StringUtils.hasText(request.getCreditCodeKeyword())) {
            wrapper.like(Enterprise::getCreditCode, request.getCreditCodeKeyword());
        }
        if (StringUtils.hasText(request.getAddressKeyword())) {
            wrapper.like(Enterprise::getAddress, request.getAddressKeyword());
        }
        if (StringUtils.hasText(request.getWebsiteKeyword())) {
            wrapper.like(Enterprise::getWebsite, request.getWebsiteKeyword());
        }
        if (StringUtils.hasText(request.getIsoCertificationsKeyword())) {
            wrapper.like(Enterprise::getIsoCertifications, request.getIsoCertificationsKeyword());
        }
        if (StringUtils.hasText(request.getAeoCertificationKeyword())) {
            wrapper.like(Enterprise::getAeoCertification, request.getAeoCertificationKeyword());
        }
        if (StringUtils.hasText(request.getOtherCertificationsKeyword())) {
            wrapper.like(Enterprise::getOtherCertifications, request.getOtherCertificationsKeyword());
        }
        if (StringUtils.hasText(request.getStage())) {
            List<String> stageVariants = StageCodeUtil.variantsForDbMatch(request.getStage());
            if (!stageVariants.isEmpty()) {
                wrapper.in(Enterprise::getStage, stageVariants);
            }
        }
        if (StringUtils.hasText(request.getDistrict())) wrapper.eq(Enterprise::getDistrict, request.getDistrict());
        if (StringUtils.hasText(request.getProvince())) wrapper.eq(Enterprise::getProvince, request.getProvince());
        if (StringUtils.hasText(request.getCity())) wrapper.eq(Enterprise::getCity, request.getCity());
        if (request.getIndustryId() != null && request.getIndustryId() > 0) {
            wrapper.eq(Enterprise::getIndustryId, request.getIndustryId());
        }
        if (StringUtils.hasText(request.getEnterpriseType())) wrapper.eq(Enterprise::getEnterpriseType, request.getEnterpriseType());
        if (request.getStaffSizeId() != null && request.getStaffSizeId() > 0) {
            wrapper.eq(Enterprise::getStaffSizeId, request.getStaffSizeId());
        }
        if (request.getDomesticRevenueId() != null && request.getDomesticRevenueId() > 0) {
            wrapper.eq(Enterprise::getDomesticRevenueId, request.getDomesticRevenueId());
        }
        if (request.getCrossBorderRevenueId() != null && request.getCrossBorderRevenueId() > 0) {
            wrapper.eq(Enterprise::getCrossBorderRevenueId, request.getCrossBorderRevenueId());
        }
        if (request.getCrossBorderRevenueMinWan() != null) {
            wrapper.ge(Enterprise::getCrossBorderRevenueWan, request.getCrossBorderRevenueMinWan());
        }
        if (request.getCrossBorderRevenueMaxWan() != null) {
            wrapper.le(Enterprise::getCrossBorderRevenueWan, request.getCrossBorderRevenueMaxWan());
        }
        if (request.getSourceId() != null && request.getSourceId() > 0) {
            wrapper.eq(Enterprise::getSourceId, request.getSourceId());
        }
        if (request.getHasCrossBorder() != null) wrapper.eq(Enterprise::getHasCrossBorder, request.getHasCrossBorder());
        if (request.getUsingErp() != null) wrapper.eq(Enterprise::getUsingErp, request.getUsingErp());
        if (StringUtils.hasText(request.getTransformationWillingness())) wrapper.eq(Enterprise::getTransformationWillingness, request.getTransformationWillingness());

        if (StringUtils.hasText(request.getMainPlatforms())) {
            for (String p : request.getMainPlatforms().split(",")) {
                if (StringUtils.hasText(p)) wrapper.like(Enterprise::getCrossBorderPlatforms, p.trim());
            }
        }
        if (StringUtils.hasText(request.getTargetMarkets())) {
            for (String m : request.getTargetMarkets().split(",")) {
                if (StringUtils.hasText(m)) wrapper.like(Enterprise::getTargetMarkets, m.trim());
            }
        }
        if (request.getHasForeignTrade() != null) {
            if (request.getHasForeignTrade() == 1) wrapper.isNotNull(Enterprise::getTradeModeId);
            else wrapper.isNull(Enterprise::getTradeModeId);
        }
        if (request.getTradeModeId() != null && request.getTradeModeId() > 0) {
            wrapper.eq(Enterprise::getTradeModeId, request.getTradeModeId());
        }
        if (request.getHasExportQualification() != null) wrapper.eq(Enterprise::getHasImportExportLicense, request.getHasExportQualification());
        if (request.getTradeTeamModeId() != null && request.getTradeTeamModeId() > 0) {
            wrapper.eq(Enterprise::getTradeTeamModeId, request.getTradeTeamModeId());
        }
        applyIntRangeFilter(wrapper, Enterprise::getTradeTeamSize, request.getTradeTeamSize());
        applyIntRangeFilter(wrapper, Enterprise::getCrossBorderTeamSize, request.getCrossBorderTeamSize());
        if (request.getCreatedDateStart() != null) {
            wrapper.ge(Enterprise::getCreatedAt, request.getCreatedDateStart().atStartOfDay());
        }
        if (request.getCreatedDateEnd() != null) {
            wrapper.lt(Enterprise::getCreatedAt, request.getCreatedDateEnd().plusDays(1).atStartOfDay());
        }
        if (StringUtils.hasText(request.getLogisticsMode())) {
            for (String mode : request.getLogisticsMode().split(",")) {
                if (StringUtils.hasText(mode)) wrapper.like(Enterprise::getCrossBorderLogistics, mode.trim());
            }
        }
        if (StringUtils.hasText(request.getPaymentMethod())) {
            for (String method : request.getPaymentMethod().split(",")) {
                if (StringUtils.hasText(method)) wrapper.like(Enterprise::getPaymentSettlement, method.trim());
            }
        }
        return wrapper;
    }

    private void aggregateMultiValueField(Object value, Map<String, Integer> map) {
        if (value == null) return;
        if (value instanceof List<?> list) {
            for (Object item : list) {
                String name = extractFieldName(item);
                if (name != null && !name.isBlank()) map.merge(name, 1, Integer::sum);
            }
        } else if (value instanceof String str) {
            for (String part : str.split(",")) {
                String name = part.trim();
                if (!name.isEmpty()) map.merge(name, 1, Integer::sum);
            }
        }
    }

    private String extractFieldName(Object item) {
        if (item instanceof String s) return s.trim();
        if (item instanceof Map<?, ?> m) {
            Object v = m.get("market");
            if (v == null) v = m.get("name");
            return v != null ? v.toString().trim() : null;
        }
        return null;
    }

    /**
     * 行业分布：固定展示「未分类」+ 字典一级行业（无数据为 0），避免柱状图只剩少数类目
     */
    private List<AnalysisStatsResponse.NameCount> buildFullIndustryStats(Map<String, Integer> industryMap) {
        List<String> level1Ordered = dictionaryCache.getLevel1IndustryNamesInOrder();
        List<AnalysisStatsResponse.NameCount> result = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        result.add(new AnalysisStatsResponse.NameCount("未分类", industryMap.getOrDefault("未分类", 0)));
        seen.add("未分类");
        for (String name : level1Ordered) {
            if (name == null || name.isBlank() || "未分类".equals(name)) {
                continue;
            }
            result.add(new AnalysisStatsResponse.NameCount(name, industryMap.getOrDefault(name, 0)));
            seen.add(name);
        }
        List<Map.Entry<String, Integer>> extras = industryMap.entrySet().stream()
                .filter(e -> !seen.contains(e.getKey()))
                .sorted((a, b) -> b.getValue() - a.getValue())
                .collect(Collectors.toList());
        for (Map.Entry<String, Integer> e : extras) {
            result.add(new AnalysisStatsResponse.NameCount(e.getKey(), e.getValue()));
        }
        return result;
    }

    private List<AnalysisStatsResponse.NameCount> toSortedNameCountList(Map<String, Integer> map) {
        return map.entrySet().stream()
                .map(e -> new AnalysisStatsResponse.NameCount(e.getKey(), e.getValue()))
                .sorted((a, b) -> b.getCount() - a.getCount())
                .collect(Collectors.toList());
    }

    private void applyIntRangeFilter(
            LambdaQueryWrapper<Enterprise> wrapper,
            com.baomidou.mybatisplus.core.toolkit.support.SFunction<Enterprise, Integer> column,
            String rangeText) {
        if (!StringUtils.hasText(rangeText)) return;
        String s = rangeText.replaceAll("[人]", "").trim();
        if (s.equals("无团队") || s.equals("0")) {
            wrapper.and(w -> w.isNull(column).or().eq(column, 0));
        } else if (s.contains("以上")) {
            String num = s.replace("以上", "").trim();
            try { wrapper.gt(column, Integer.parseInt(num)); } catch (NumberFormatException ignored) {}
        } else if (s.contains("-")) {
            String[] parts = s.split("-");
            try {
                wrapper.between(column, Integer.parseInt(parts[0].trim()), Integer.parseInt(parts[1].trim()));
            } catch (Exception ignored) {}
        }
    }

    private Set<Integer> mergeMatchedEnterpriseIds(Set<Integer> current, Set<Integer> incoming) {
        if (incoming == null) {
            return current;
        }
        if (current == null) {
            return new LinkedHashSet<>(incoming);
        }
        current.retainAll(incoming);
        return current;
    }

    private Set<Integer> findEnterpriseIdsByProductFilters(EnterpriseQueryRequest request) {
        // automationLevelId==0 常见于未绑定/误传，不得当作有效「产品筛选」，否则易得到空 ID 集导致整页统计全 0
        boolean hasProductFilters = (request.getAutomationLevelId() != null && request.getAutomationLevelId() > 0)
                || StringUtils.hasText(request.getLocalProcurementRatio())
                || StringUtils.hasText(request.getLogisticsPartnerIds());
        if (!hasProductFilters) {
            return null;
        }

        LambdaQueryWrapper<EnterpriseProduct> productWrapper = new LambdaQueryWrapper<>();
        productWrapper.select(
                EnterpriseProduct::getEnterpriseId,
                EnterpriseProduct::getAutomationLevelId,
                EnterpriseProduct::getLocalProcurementRatio,
                EnterpriseProduct::getLogisticsPartnerIds
        );
        if (request.getAutomationLevelId() != null && request.getAutomationLevelId() > 0) {
            productWrapper.eq(EnterpriseProduct::getAutomationLevelId, request.getAutomationLevelId());
        }

        Set<Integer> selectedLogisticsIds = parseIntegerSet(request.getLogisticsPartnerIds());
        return productMapper.selectList(productWrapper).stream()
                .filter(product -> matchesLocalProcurementRatio(product.getLocalProcurementRatio(), request.getLocalProcurementRatio()))
                .filter(product -> matchesLogisticsPartnerIds(product.getLogisticsPartnerIds(), selectedLogisticsIds))
                .map(EnterpriseProduct::getEnterpriseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<Integer> findEnterpriseIdsByLastFollowup(Integer lastFollowupDays) {
        if (lastFollowupDays == null) {
            return null;
        }

        Map<Integer, LocalDate> lastFollowDates = new HashMap<>();
        for (Map<String, Object> row : followUpRecordMapper.selectLastFollowDates()) {
            Object enterpriseId = row.get("enterpriseId");
            if (!(enterpriseId instanceof Number number)) {
                continue;
            }
            LocalDate lastFollowDate = convertToLocalDate(row.get("lastFollowDate"));
            if (lastFollowDate != null) {
                lastFollowDates.put(number.intValue(), lastFollowDate);
            }
        }

        LocalDate threshold = LocalDate.now().minusDays(Math.abs((long) lastFollowupDays));
        return enterpriseMapper.selectList(
                        new LambdaQueryWrapper<Enterprise>()
                                .select(Enterprise::getId)
                                .eq(Enterprise::getIsDeleted, 0)
                ).stream()
                .map(Enterprise::getId)
                .filter(Objects::nonNull)
                .filter(enterpriseId -> {
                    LocalDate lastFollowDate = lastFollowDates.get(enterpriseId);
                    if (lastFollowupDays > 0) {
                        return lastFollowDate != null && !lastFollowDate.isBefore(threshold);
                    }
                    return lastFollowDate == null || lastFollowDate.isBefore(threshold);
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<Integer> findEnterpriseIdsByRequirements(String requirementIds) {
        Set<String> selectedRequirementIds = parseStringSet(requirementIds);
        if (selectedRequirementIds.isEmpty()) {
            return null;
        }

        return enterpriseMapper.selectList(
                        new LambdaQueryWrapper<Enterprise>()
                                .select(
                                        Enterprise::getId,
                                        Enterprise::getDimensionSelections,
                                        Enterprise::getRemovedRequirements,
                                        Enterprise::getCustomRequirements
                                )
                                .eq(Enterprise::getIsDeleted, 0)
                ).stream()
                .filter(enterprise -> {
                    Set<String> effectiveRequirementIds = requirementMatchEngine.calculateEffectiveRequirementIds(
                            enterprise.getDimensionSelections(),
                            enterprise.getRemovedRequirements(),
                            enterprise.getCustomRequirements()
                    );
                    return effectiveRequirementIds.stream().anyMatch(selectedRequirementIds::contains);
                })
                .map(Enterprise::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private boolean matchesLocalProcurementRatio(String actualValue, String filterValue) {
        if (!StringUtils.hasText(filterValue)) {
            return true;
        }
        if (!StringUtils.hasText(actualValue)) {
            return false;
        }
        Double numericValue = extractFirstNumber(actualValue);
        if (numericValue == null) {
            return filterValue.equals(actualValue.trim());
        }
        return switch (filterValue) {
            case "90%以上" -> numericValue >= 90;
            case "70%-90%" -> numericValue >= 70 && numericValue < 90;
            case "50%-70%" -> numericValue >= 50 && numericValue < 70;
            case "30%-50%" -> numericValue >= 30 && numericValue < 50;
            case "30%以下" -> numericValue < 30;
            default -> filterValue.equals(actualValue.trim());
        };
    }

    private boolean matchesLogisticsPartnerIds(List<Integer> actualIds, Set<Integer> selectedIds) {
        if (selectedIds.isEmpty()) {
            return true;
        }
        if (actualIds == null || actualIds.isEmpty()) {
            return false;
        }
        return actualIds.stream().anyMatch(selectedIds::contains);
    }

    private Set<Integer> parseIntegerSet(String rawValue) {
        Set<Integer> values = new LinkedHashSet<>();
        if (!StringUtils.hasText(rawValue)) {
            return values;
        }
        for (String part : rawValue.split(",")) {
            String value = part.trim();
            if (value.isEmpty()) {
                continue;
            }
            try {
                values.add(Integer.parseInt(value));
            } catch (NumberFormatException ignored) {
                log.warn("无法解析整型筛选值: {}", value);
            }
        }
        return values;
    }

    private Set<String> parseStringSet(String rawValue) {
        Set<String> values = new LinkedHashSet<>();
        if (!StringUtils.hasText(rawValue)) {
            return values;
        }
        for (String part : rawValue.split(",")) {
            String value = part.trim();
            if (!value.isEmpty()) {
                values.add(value);
            }
        }
        return values;
    }

    private LocalDate convertToLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value != null) {
            try {
                return LocalDate.parse(String.valueOf(value));
            } catch (Exception ignored) {
                log.warn("无法解析跟进日期: {}", value);
            }
        }
        return null;
    }

    private Double extractFirstNumber(String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            return null;
        }
        StringBuilder builder = new StringBuilder();
        boolean seenDot = false;
        for (char current : rawValue.toCharArray()) {
            if (Character.isDigit(current)) {
                builder.append(current);
                continue;
            }
            if (current == '.' && !seenDot) {
                builder.append(current);
                seenDot = true;
                continue;
            }
            if (builder.length() > 0) {
                break;
            }
        }
        if (builder.length() == 0) {
            return null;
        }
        try {
            return Double.parseDouble(builder.toString());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String resolveCrossBorderRevenueLabel(Enterprise enterprise) {
        if (enterprise.getCrossBorderRevenueWan() != null) {
            return enterprise.getCrossBorderRevenueWan().stripTrailingZeros().toPlainString();
        }
        return dictionaryCache.getOptionLabel(enterprise.getCrossBorderRevenueId());
    }

    private String resolveDomesticRevenueLabel(Enterprise enterprise) {
        if (enterprise.getDomesticRevenueWan() != null) {
            return enterprise.getDomesticRevenueWan().stripTrailingZeros().toPlainString();
        }
        return dictionaryCache.getOptionLabel(enterprise.getDomesticRevenueId());
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
        if (enterprise.getCrossBorderRevenueWan() != null) {
            enterprise.setCrossBorderRevenueId(null);
        }
        
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
        
        dashboardService.evictAllCache();
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
        if (request.getEstablishedDate() != null) enterprise.setEstablishedDate(java.time.LocalDate.parse(request.getEstablishedDate()));
        if (request.getRegisteredCapital() != null) enterprise.setRegisteredCapital(request.getRegisteredCapital());
        if (request.getProvince() != null) enterprise.setProvince(request.getProvince());
        if (request.getCity() != null) enterprise.setCity(request.getCity());
        if (request.getDistrict() != null) enterprise.setDistrict(request.getDistrict());
        if (request.getAddress() != null) enterprise.setAddress(request.getAddress());
        if (request.getIndustryId() != null) enterprise.setIndustryId(request.getIndustryId());
        if (request.getEnterpriseType() != null) enterprise.setEnterpriseType(request.getEnterpriseType());
        if (request.getStaffSizeId() != null) enterprise.setStaffSizeId(request.getStaffSizeId());
        if (request.getWebsite() != null) enterprise.setWebsite(request.getWebsite());
        // 国内营收：touched 为 true，或请求里带了非空精确万元数（兼容 touched 未绑定的情况）；否则仍可按档位 ID 更新
        if (Boolean.TRUE.equals(request.getDomesticRevenueWanTouched())
                || request.getDomesticRevenueWan() != null) {
            enterprise.setDomesticRevenueWan(request.getDomesticRevenueWan());
            enterprise.setDomesticRevenueId(null);
        } else if (request.getDomesticRevenueId() != null) {
            enterprise.setDomesticRevenueId(request.getDomesticRevenueId());
            enterprise.setDomesticRevenueWan(null);
        }
        if (Boolean.TRUE.equals(request.getCrossBorderRevenueWanTouched())
                || request.getCrossBorderRevenueWan() != null) {
            enterprise.setCrossBorderRevenueWan(request.getCrossBorderRevenueWan());
            enterprise.setCrossBorderRevenueId(null);
        } else if (request.getCrossBorderRevenueId() != null) {
            enterprise.setCrossBorderRevenueId(request.getCrossBorderRevenueId());
            enterprise.setCrossBorderRevenueWan(null);
        }
        if (request.getSourceId() != null) enterprise.setSourceId(request.getSourceId());
        
        // 品牌信息
        if (request.getHasOwnBrand() != null) enterprise.setHasOwnBrand(request.getHasOwnBrand());
        if (request.getBrandNames() != null) enterprise.setBrandNames(request.getBrandNames());
        
        // 外贸信息
        if (request.getTargetRegionIds() != null) enterprise.setTargetRegionIds(request.getTargetRegionIds());
        if (request.getTargetCountryIds() != null) enterprise.setTargetCountryIds(request.getTargetCountryIds());
        if (request.getTradeModeId() != null) enterprise.setTradeModeId(request.getTradeModeId());
        if (request.getHasImportExportLicense() != null) enterprise.setHasImportExportLicense(request.getHasImportExportLicense());
        if (request.getIsoCertifications() != null) enterprise.setIsoCertifications(request.getIsoCertifications());
        if (request.getAeoCertification() != null) enterprise.setAeoCertification(request.getAeoCertification());
        if (request.getOtherCertifications() != null) enterprise.setOtherCertifications(request.getOtherCertifications());
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
        if (request.getHasOverseasDistributors() != null) enterprise.setHasOverseasDistributors(request.getHasOverseasDistributors());
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
        
        // 竞争力信息
        if (request.getCompetitionPosition() != null) enterprise.setCompetitionPosition(request.getCompetitionPosition());
        if (request.getCompetitionDescription() != null) enterprise.setCompetitionDescription(request.getCompetitionDescription());
        if (request.getPainPoints() != null) enterprise.setPainPoints(request.getPainPoints());
        if (request.getCurrentRiskTags() != null) enterprise.setCurrentRiskTags(request.getCurrentRiskTags());
        if (request.getRiskDescription() != null) enterprise.setRiskDescription(request.getRiskDescription());
        
        // 三中心合作
        if (request.getTricenterDemands() != null) enterprise.setTricenterDemands(request.getTricenterDemands());
        if (request.getTricenterConcerns() != null) enterprise.setTricenterConcerns(request.getTricenterConcerns());
        
        // 需求分析
        if (request.getDimensionSelections() != null) enterprise.setDimensionSelections(request.getDimensionSelections());
        if (request.getRemovedRequirements() != null) enterprise.setRemovedRequirements(request.getRemovedRequirements());
        if (request.getCustomRequirements() != null) enterprise.setCustomRequirements(request.getCustomRequirements());
        
        enterpriseMapper.updateById(enterprise);
        
        log.info("更新企业成功: id={}", id);
        
        dashboardService.evictAllCache();
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
        dashboardService.evictAllCache();
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
        dashboardService.evictAllCache();
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
     * 批量转换列表响应（消除 N+1：1次分页 + 1次联系人批量 + 0次字典查库）
     */
    private List<EnterpriseListResponse> batchConvertToListResponse(List<Enterprise> enterprises) {
        if (enterprises.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> enterpriseIds = enterprises.stream()
                .map(Enterprise::getId)
                .collect(Collectors.toList());
        Map<Integer, List<EnterpriseContact>> contactsByEntId = contactMapper
                .selectByEnterpriseIds(enterpriseIds).stream()
                .collect(Collectors.groupingBy(EnterpriseContact::getEnterpriseId));

        return enterprises.stream().map(enterprise -> {
            EnterpriseListResponse response = new EnterpriseListResponse();
            response.setId(enterprise.getId());
            response.setName(enterprise.getName());
            response.setDistrict(enterprise.getDistrict());
            response.setEnterpriseType(enterprise.getEnterpriseType());
            String stageCode = StageCodeUtil.normalize(enterprise.getStage());
            response.setStage(stageCode);
            response.setHasCrossBorder(enterprise.getHasCrossBorder());
            response.setCreatedAt(enterprise.getCreatedAt());

            response.setIndustryName(dictionaryCache.getIndustryName(enterprise.getIndustryId()));

            SystemOption stageOption = dictionaryCache.getOptionByValue("stage", stageCode);
            if (stageOption != null) {
                response.setStageName(stageOption.getLabel());
                response.setStageColor(stageOption.getColor());
            }

            List<EnterpriseContact> contacts = contactsByEntId.get(enterprise.getId());
            if (contacts != null && !contacts.isEmpty()) {
                response.setContacts(contacts.stream().map(c -> {
                    EnterpriseListResponse.ContactInfo info = new EnterpriseListResponse.ContactInfo();
                    info.setName(c.getName());
                    info.setPhone(c.getPhone());
                    info.setEmail(c.getEmail());
                    info.setIsPrimary(c.getIsPrimary() == 1);
                    return info;
                }).collect(Collectors.toList()));
            }

            return response;
        }).collect(Collectors.toList());
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
        response.setEstablishedDate(enterprise.getEstablishedDate());
        response.setRegisteredCapital(enterprise.getRegisteredCapital());
        response.setProvince(enterprise.getProvince());
        response.setCity(enterprise.getCity());
        response.setDistrict(enterprise.getDistrict());
        response.setAddress(enterprise.getAddress());
        response.setIndustryId(enterprise.getIndustryId());
        response.setEnterpriseType(enterprise.getEnterpriseType());
        response.setStaffSizeId(enterprise.getStaffSizeId());
        response.setWebsite(enterprise.getWebsite());
        response.setDomesticRevenueId(enterprise.getDomesticRevenueId());
        response.setDomesticRevenueWan(enterprise.getDomesticRevenueWan());
        response.setCrossBorderRevenueId(enterprise.getCrossBorderRevenueId());
        response.setCrossBorderRevenueWan(enterprise.getCrossBorderRevenueWan());
        response.setSourceId(enterprise.getSourceId());
        String stageCode = StageCodeUtil.normalize(enterprise.getStage());
        response.setStage(stageCode);
        response.setIndustryName(dictionaryCache.getIndustryName(enterprise.getIndustryId()));

        SystemOption stageOption = dictionaryCache.getOptionByValue("stage", stageCode);
        if (stageOption != null) {
            response.setStageName(stageOption.getLabel());
            response.setStageColor(stageOption.getColor());
        }

        response.setStaffSizeLabel(dictionaryCache.getOptionLabel(enterprise.getStaffSizeId()));
        response.setDomesticRevenueLabel(resolveDomesticRevenueLabel(enterprise));
        response.setCrossBorderRevenueLabel(resolveCrossBorderRevenueLabel(enterprise));
        response.setSourceLabel(dictionaryCache.getOptionLabel(enterprise.getSourceId()));
        response.setTradeModeLabel(dictionaryCache.getOptionLabel(enterprise.getTradeModeId()));
        response.setTradeTeamModeLabel(dictionaryCache.getOptionLabel(enterprise.getTradeTeamModeId()));
        
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
        response.setIsoCertifications(enterprise.getIsoCertifications());
        response.setAeoCertification(enterprise.getAeoCertification());
        response.setOtherCertifications(enterprise.getOtherCertifications());
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
        response.setHasOverseasDistributors(enterprise.getHasOverseasDistributors() != null && enterprise.getHasOverseasDistributors() == 1);
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
        
        // 竞争力信息
        response.setCompetitionPosition(enterprise.getCompetitionPosition());
        response.setCompetitionDescription(enterprise.getCompetitionDescription());
        response.setPainPoints(enterprise.getPainPoints());
        response.setCurrentRiskTags(enterprise.getCurrentRiskTags());
        response.setRiskDescription(enterprise.getRiskDescription());
        
        // 三中心合作
        response.setTricenterDemands(enterprise.getTricenterDemands());
        response.setTricenterConcerns(enterprise.getTricenterConcerns());
        
        // 需求分析
        response.setDimensionSelections(enterprise.getDimensionSelections());
        response.setRemovedRequirements(enterprise.getRemovedRequirements());
        response.setCustomRequirements(enterprise.getCustomRequirements());
        
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
                info.setExportRatio(p.getExportRatio());
                info.setProfitMargin(p.getProfitMargin());
                info.setLocalProcurementRatio(p.getLocalProcurementRatio());
                info.setAutomationLevelId(p.getAutomationLevelId());
                info.setAnnualCapacity(p.getAnnualCapacity());
                info.setLogisticsPartnerIds(p.getLogisticsPartnerIds());
                
                if (p.getCategoryId() != null) {
                    ProductCategory category = productCategoryMapper.selectById(p.getCategoryId());
                    if (category != null) {
                        info.setCategoryName(category.getName());
                    }
                }

                info.setCertificationNames(resolveOptionLabels(p.getCertificationIds()));
                info.setTargetRegionNames(resolveOptionLabels(p.getTargetRegionIds()));
                info.setAutomationLevelName(dictionaryCache.getOptionLabel(p.getAutomationLevelId()));
                info.setLogisticsPartnerNames(resolveOptionLabels(p.getLogisticsPartnerIds()));
                
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

    private List<String> resolveOptionLabels(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream()
                .map(dictionaryCache::getOptionLabel)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
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
                    if (StringUtils.hasText(data.getEstablishedDate())) {
                        try { enterprise.setEstablishedDate(java.time.LocalDate.parse(data.getEstablishedDate().trim())); } catch (Exception ignored) {}
                    }
                    if (StringUtils.hasText(data.getRegisteredCapital())) enterprise.setRegisteredCapital(data.getRegisteredCapital().trim());
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

                    // 资质认证
                    if (StringUtils.hasText(data.getIsoCertifications())) enterprise.setIsoCertifications(data.getIsoCertifications().trim());
                    if (StringUtils.hasText(data.getAeoCertification())) enterprise.setAeoCertification(data.getAeoCertification().trim());
                    if (StringUtils.hasText(data.getOtherCertifications())) enterprise.setOtherCertifications(data.getOtherCertifications().trim());

                    if (StringUtils.hasText(data.getHasOverseasDistributors())) {
                        enterprise.setHasOverseasDistributors("是".equals(data.getHasOverseasDistributors().trim()) ? 1 : 0);
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
        
        dashboardService.evictAllCache();
        return ImportResultResponse.builder()
                .success(successCount)
                .failed(failCount)
                .errors(errors)
                .build();
    }

    @Override
    public void exportEnterprises(EnterpriseQueryRequest request, HttpServletResponse response) {
        Set<Integer> matchedIds = resolveExternalFilters(request);
        if (matchedIds != null && matchedIds.isEmpty()) {
            try {
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setCharacterEncoding("utf-8");
                String fileName = URLEncoder.encode("企业列表", "UTF-8").replaceAll("\\+", "%20");
                response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
                try (XSSFWorkbook wb = new XSSFWorkbook()) {
                    EnterpriseExportListSheetPoi.writeSheet(wb, Collections.emptyList());
                    EnterpriseExportRequirementMatrixSheet.append(
                            wb,
                            Collections.emptyList(),
                            optionsService.getRequirementConfig(),
                            requirementMatchEngine,
                            request,
                            dictionaryCache);
                    wb.write(response.getOutputStream());
                    response.getOutputStream().flush();
                }
            } catch (Exception e) {
                log.error("导出企业失败", e);
                throw new BusinessException("导出失败: " + e.getMessage());
            }
            return;
        }
        LambdaQueryWrapper<Enterprise> wrapper = buildFilterWrapper(request, matchedIds);
        wrapper.orderByDesc(Enterprise::getCreatedAt);
        wrapper.last("LIMIT 10000");
        List<Enterprise> enterprises = enterpriseMapper.selectList(wrapper);

        // 批量查主联系人
        List<Integer> eIds = enterprises.stream().map(Enterprise::getId).collect(Collectors.toList());
        Map<Integer, EnterpriseContact> primaryContacts = new HashMap<>();
        if (!eIds.isEmpty()) {
            LambdaQueryWrapper<EnterpriseContact> cw = new LambdaQueryWrapper<>();
            cw.in(EnterpriseContact::getEnterpriseId, eIds);
            List<EnterpriseContact> allContacts = contactMapper.selectList(cw);
            for (EnterpriseContact c : allContacts) {
                if (c.getIsPrimary() != null && c.getIsPrimary() == 1) {
                    primaryContacts.put(c.getEnterpriseId(), c);
                } else if (!primaryContacts.containsKey(c.getEnterpriseId())) {
                    primaryContacts.put(c.getEnterpriseId(), c);
                }
            }
        }

        List<EnterpriseExcelData> excelDataList = enterprises.stream().map(e -> {
            EnterpriseExcelData data = new EnterpriseExcelData();
            data.setName(e.getName());
            data.setCreditCode(e.getCreditCode());
            data.setEstablishedDate(e.getEstablishedDate() != null ? e.getEstablishedDate().toString() : null);
            data.setRegisteredCapital(e.getRegisteredCapital());
            data.setDistrict(e.getDistrict());
            data.setAddress(e.getAddress());
            data.setIndustryName(dictionaryCache.getIndustryName(e.getIndustryId()));
            data.setEnterpriseType(e.getEnterpriseType());
            data.setStaffSize(dictionaryCache.getOptionLabel(e.getStaffSizeId()));
            data.setWebsite(e.getWebsite());

            String stageCode = StageCodeUtil.normalize(e.getStage());
            SystemOption stageOpt = dictionaryCache.getOptionByValue("stage", stageCode);
            data.setStageName(stageOpt != null ? stageOpt.getLabel() : stageCode);
            data.setHasCrossBorder(e.getHasCrossBorder() != null && e.getHasCrossBorder() == 1 ? "是" : "否");

            // 联系人
            EnterpriseContact contact = primaryContacts.get(e.getId());
            if (contact != null) {
                data.setContactName(contact.getName());
                data.setContactPhone(contact.getPhone());
                data.setContactPosition(contact.getPosition());
            }

            // 资质认证
            data.setIsoCertifications(e.getIsoCertifications());
            data.setAeoCertification(e.getAeoCertification());
            data.setOtherCertifications(e.getOtherCertifications());

            data.setHasOverseasDistributors(e.getHasOverseasDistributors() != null && e.getHasOverseasDistributors() == 1 ? "是" : "否");

            return data;
        }).collect(Collectors.toList());
        
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("企业列表", "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            try (XSSFWorkbook wb = new XSSFWorkbook()) {
                EnterpriseExportListSheetPoi.writeSheet(wb, excelDataList);
                EnterpriseExportRequirementMatrixSheet.append(
                        wb,
                        enterprises,
                        optionsService.getRequirementConfig(),
                        requirementMatchEngine,
                        request,
                        dictionaryCache);
                wb.write(response.getOutputStream());
                response.getOutputStream().flush();
            }
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
        example.setEstablishedDate("2015-06-01");
        example.setRegisteredCapital("500万元");
        example.setDistrict("新北区");
        example.setAddress("常州市新北区XX路XX号");
        example.setEnterpriseType("生产型");
        example.setWebsite("https://example.com");
        example.setContactName("张三");
        example.setContactPhone("13800138000");
        example.setContactPosition("总经理");
        example.setHasCrossBorder("否");
        example.setIsoCertifications("ISO9001:2015");
        example.setAeoCertification("一般认证");
        example.setOtherCertifications("CE、FDA");
        example.setHasOverseasDistributors("否");
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

    @Override
    @Transactional
    public int batchDelete(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        int count = enterpriseMapper.deleteBatchIds(ids);
        log.info("批量删除企业成功: ids={}, 实际删除={}", ids, count);
        dashboardService.evictAllCache();
        return count;
    }

    @Override
    @Transactional
    public int batchChangeStage(List<Integer> ids, String stage, String reason, Integer operatorId) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (Integer id : ids) {
            Enterprise enterprise = enterpriseMapper.selectById(id);
            if (enterprise == null || enterprise.getIsDeleted() == 1) {
                continue;
            }
            String oldStage = enterprise.getStage();
            if (oldStage.equals(stage)) {
                continue;
            }
            enterprise.setStage(stage);
            enterpriseMapper.updateById(enterprise);

            StageChangeLog changeLog = new StageChangeLog();
            changeLog.setEnterpriseId(id);
            changeLog.setStageFrom(oldStage);
            changeLog.setStageTo(stage);
            changeLog.setReason(reason);
            changeLog.setOperatorId(operatorId);
            stageChangeLogMapper.insert(changeLog);
            count++;
        }
        log.info("批量变更阶段成功: ids={}, stage={}, 实际变更={}", ids, stage, count);
        dashboardService.evictAllCache();
        return count;
    }
}
