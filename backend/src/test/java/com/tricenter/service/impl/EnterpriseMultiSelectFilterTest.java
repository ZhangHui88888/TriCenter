package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.dto.request.EnterpriseQueryRequest;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.entity.SystemOption;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.service.*;
import com.tricenter.util.EnterpriseExportRequirementMatrixSheet;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EnterpriseMultiSelectFilterTest {
    private EnterpriseServiceImpl service;
    private EnterpriseMapper enterpriseMapper;
    private EnterpriseProductMapper productMapper;
    private DictionaryCacheService dictionary;
    private final List<LambdaQueryWrapper<Enterprise>> enterpriseQueries = new ArrayList<>();
    private final List<LambdaQueryWrapper<EnterpriseProduct>> productQueries = new ArrayList<>();

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), EnterpriseProduct.class);
        enterpriseMapper = mock(EnterpriseMapper.class);
        productMapper = mock(EnterpriseProductMapper.class);
        dictionary = mock(DictionaryCacheService.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(7);
        when(enterpriseMapper.selectList(any())).thenAnswer(invocation -> {
            enterpriseQueries.add(invocation.getArgument(0));
            return List.of();
        });
        when(enterpriseMapper.selectCount(any())).thenAnswer(invocation -> {
            enterpriseQueries.add(invocation.getArgument(0));
            return 0L;
        });
        when(enterpriseMapper.selectPage(any(Page.class), any())).thenAnswer(invocation -> {
            enterpriseQueries.add(invocation.getArgument(1));
            return new Page<Enterprise>();
        });
        when(productMapper.selectList(any())).thenAnswer(invocation -> {
            productQueries.add(invocation.getArgument(0));
            return List.of();
        });
        service = new EnterpriseServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                productMapper, mock(EnterprisePatentMapper.class), mock(CategoryMapper.class),
                mock(StageChangeLogMapper.class), mock(FollowUpRecordMapper.class),
                mock(DashboardCacheInvalidator.class), dictionary, mock(RequirementMatchEngine.class),
                mock(OptionsService.class), mock(ProviderMapper.class), cityContext, mock(CityAccessService.class));
    }

    @Test
    void listAnalysisOverviewAndExportUseTheSameMultiSelectScope() {
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setSourceIds("12,34");
        request.setStage("HAS_DEMAND, signed ");
        request.setMainPlatforms("Amazon,TikTok");

        service.getEnterpriseList(request);
        service.getAnalysisStats(request);
        service.getOverviewStats(request);
        service.exportEnterprises(request, new MockHttpServletResponse());

        assertThat(enterpriseQueries).hasSize(7);
        for (LambdaQueryWrapper<Enterprise> query : enterpriseQueries) {
            assertThat(sql(query)).contains("is_deleted = ? AND city_id = ?",
                    "source_id IN (?,?)", "stage IN (?,?,?,?)",
                    "AND (cross_border_platforms LIKE ? OR cross_border_platforms LIKE ?)");
            assertThat(query.getParamNameValuePairs().values()).contains(7, 12, 34,
                    "HAS_DEMAND", "has_demand", "SIGNED", "signed", "%Amazon%", "%TikTok%");
        }
    }

    @Test
    void regionCountryTradeAndTextChoicesAreOrGroupsJoinedByAnd() {
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setTargetRegionIds("11,22");
        request.setTargetCountryCode("US,DE");
        request.setTradeModeId("31,32");
        request.setTargetMarkets("北美,欧洲");
        request.setLogisticsMode("海运,FBA");
        request.setPaymentMethod("PayPal,T/T电汇");
        service.getAnalysisStats(request);

        LambdaQueryWrapper<Enterprise> query = enterpriseQueries.get(0);
        assertThat(sql(query)).contains(
                "AND (JSON_CONTAINS(target_region_ids, CAST(? AS JSON)) OR JSON_CONTAINS(target_region_ids, CAST(? AS JSON)))",
                "AND (JSON_CONTAINS(target_country_ids, JSON_QUOTE(?)) OR JSON_CONTAINS(target_country_ids, JSON_QUOTE(?)))",
                "AND trade_mode_id IN (?,?)",
                "AND (target_markets LIKE ? OR target_markets LIKE ?)",
                "AND (cross_border_logistics LIKE ? OR cross_border_logistics LIKE ?)",
                "AND (payment_settlement LIKE ? OR payment_settlement LIKE ?)");
        assertThat(query.getParamNameValuePairs().values()).contains("11", "22", "US", "DE", 31, 32,
                "%北美%", "%欧洲%", "%海运%", "%FBA%", "%PayPal%", "%T/T电汇%");
    }

    @Test
    void multipleCategoriesIncludeDescendantsAndCertificationsMatchEitherChoice() {
        when(dictionary.getCategoryDescendantIds(10)).thenReturn(Set.of(10, 11));
        when(dictionary.getCategoryDescendantIds(20)).thenReturn(Set.of(20, 21));
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setProductCategoryIds("10,20");
        request.setProductCertificationIds("51,52");
        service.getAnalysisStats(request);

        LambdaQueryWrapper<EnterpriseProduct> query = productQueries.get(0);
        assertThat(sql(query)).contains("city_id = 7", "category_id IN (?,?,?,?)",
                "AND (JSON_CONTAINS(certification_ids, CAST(? AS JSON)) OR JSON_CONTAINS(certification_ids, CAST(? AS JSON)))");
        assertThat(query.getParamNameValuePairs().values()).contains(10, 11, 20, 21, "51", "52");
        assertThat(enterpriseQueries).isEmpty(); // 产品无匹配时不能回退为查询全部企业。
    }

    @Test
    void logisticsPartnersMatchAnySelectionAndDeduplicateEnterprises() {
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setLogisticsPartnerIds("61,62");
        doReturn(List.of(
                product(101, List.of(61)), product(101, List.of(62)),
                product(102, List.of(62)), product(103, List.of(63))))
                .when(productMapper).selectList(any());
        service.getAnalysisStats(request);

        LambdaQueryWrapper<Enterprise> query = enterpriseQueries.get(0);
        assertThat(sql(query)).contains("AND id IN (?,?)");
        assertThat(query.getParamNameValuePairs().values()).contains(101, 102).doesNotContain(103);
    }

    @Test
    void legacySingleIdsStillFilter() {
        when(dictionary.getCategoryDescendantIds(10)).thenReturn(Set.of(10));
        doAnswer(invocation -> {
            productQueries.add(invocation.getArgument(0));
            return List.of(product(101, List.of()));
        }).when(productMapper).selectList(any());
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setSourceId(12);
        request.setTargetRegionId(22);
        request.setProductCategoryId(10);
        request.setProductCertificationId(51);
        request.setStage("SIGNED");
        service.getAnalysisStats(request);

        assertThat(sql(enterpriseQueries.get(0))).contains("source_id IN (?)", "stage IN (?,?)",
                "JSON_CONTAINS(target_region_ids, CAST(? AS JSON))");
        assertThat(sql(productQueries.get(0))).contains("category_id IN (?)",
                "JSON_CONTAINS(certification_ids, CAST(? AS JSON))");
    }

    @Test
    void clearingMultiSelectFiltersRemovesRestrictions() {
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setSourceIds("");
        request.setStage(" , ");
        request.setTargetRegionIds("");
        request.setProductCategoryIds("");
        request.setProductCertificationIds("");
        request.setMainPlatforms("");
        service.getAnalysisStats(request);
        assertThat(sql(enterpriseQueries.get(0))).isEqualTo("(is_deleted = ? AND city_id = ?)");
        assertThat(productQueries).isEmpty();
    }

    @Test
    void exportSummaryDisplaysAllSelectedSourceAndStageLabels() {
        when(dictionary.getOptionLabel(12)).thenReturn("来源A");
        when(dictionary.getOptionLabel(34)).thenReturn("来源B");
        SystemOption demand = new SystemOption();
        demand.setLabel("有明确需求");
        SystemOption signed = new SystemOption();
        signed.setLabel("已签约");
        when(dictionary.getOptionByValue("stage", "HAS_DEMAND")).thenReturn(demand);
        when(dictionary.getOptionByValue("stage", "SIGNED")).thenReturn(signed);
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setSourceIds("12,34");
        request.setStage("HAS_DEMAND,SIGNED");
        assertThat(EnterpriseExportRequirementMatrixSheet.buildExportFilterSummary(request, dictionary))
                .contains("企业来源：来源A、来源B", "漏斗阶段：有明确需求、已签约");
    }

    private String sql(LambdaQueryWrapper<?> wrapper) {
        return wrapper.getSqlSegment().replaceAll("#\\{[^}]+}", "?");
    }

    private EnterpriseProduct product(int enterpriseId, List<Integer> logisticsIds) {
        EnterpriseProduct product = new EnterpriseProduct();
        product.setEnterpriseId(enterpriseId);
        product.setLogisticsPartnerIds(logisticsIds);
        return product;
    }
}
