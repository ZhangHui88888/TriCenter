package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.dto.request.EnterpriseQueryRequest;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** 企业列表导出：勾选了企业就只导这些（和调研表一致），并且仍限定在当前城市。 */
class EnterpriseExportSelectedTest {
    private EnterpriseServiceImpl service;
    private EnterpriseMapper enterpriseMapper;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        enterpriseMapper = mock(EnterpriseMapper.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(7);
        OptionsService optionsService = mock(OptionsService.class);
        when(optionsService.getRequirementConfig()).thenReturn(new RequirementConfigResponse());
        service = new EnterpriseServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(EnterprisePatentMapper.class), mock(CategoryMapper.class),
                mock(StageChangeLogMapper.class), mock(FollowUpRecordMapper.class),
                mock(DashboardCacheInvalidator.class), mock(DictionaryCacheService.class), mock(RequirementMatchEngine.class),
                optionsService, mock(ProviderMapper.class), cityContext, mock(CityAccessService.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void exportOfTickedEnterprisesQueriesOnlyThoseIdsWithinTheCity() {
        when(enterpriseMapper.selectList(any())).thenReturn(List.of());
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setIds(List.of(11, 22, 33));

        service.exportEnterprises(request, new MockHttpServletResponse());

        ArgumentCaptor<LambdaQueryWrapper<Enterprise>> wrapper = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(enterpriseMapper).selectList(wrapper.capture());
        String sql = wrapper.getValue().getSqlSegment();
        assertThat(sql).contains("city_id =").contains("id IN");
        assertThat(wrapper.getValue().getParamNameValuePairs().values()).contains(7, 11, 22, 33);
    }

    @Test
    @SuppressWarnings("unchecked")
    void exportWithoutTickedEnterprisesDoesNotRestrictIds() {
        when(enterpriseMapper.selectList(any())).thenReturn(List.of());

        service.exportEnterprises(new EnterpriseQueryRequest(), new MockHttpServletResponse());

        ArgumentCaptor<LambdaQueryWrapper<Enterprise>> wrapper = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(enterpriseMapper).selectList(wrapper.capture());
        assertThat(wrapper.getValue().getSqlSegment()).doesNotContain("id IN");
    }
}
