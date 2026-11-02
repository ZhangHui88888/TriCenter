package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.EnterpriseQueryRequest;
import com.tricenter.dto.response.EnterpriseListResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EnterpriseListAllRowsTest {
    private EnterpriseServiceImpl service;
    private EnterpriseMapper enterpriseMapper;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        enterpriseMapper = mock(EnterpriseMapper.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(7);
        service = new EnterpriseServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(EnterprisePatentMapper.class), mock(CategoryMapper.class),
                mock(StageChangeLogMapper.class), mock(FollowUpRecordMapper.class),
                mock(DashboardCacheInvalidator.class), mock(DictionaryCacheService.class), mock(RequirementMatchEngine.class),
                mock(OptionsService.class), mock(ProviderMapper.class), cityContext, mock(CityAccessService.class));
    }

    @Test
    void allRowsReportsTheReturnedCountBecauseMybatisPlusSkipsTheCountQuery() {
        // MyBatis-Plus 对 size < 0 的分页不做 count，total 保持 0
        when(enterpriseMapper.selectPage(any(Page.class), any())).thenAnswer(invocation -> {
            Page<Enterprise> page = invocation.getArgument(0);
            page.setRecords(IntStream.rangeClosed(1, 3).mapToObj(i -> {
                Enterprise e = new Enterprise();
                e.setId(i);
                e.setName("企业" + i);
                return e;
            }).toList());
            page.setTotal(0);
            return page;
        });
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setPageSize(EnterpriseQueryRequest.ALL_ROWS);

        PageResult<EnterpriseListResponse> result = service.getEnterpriseList(request);

        assertThat(result.getList()).hasSize(3);
        assertThat(result.getTotal()).isEqualTo(3);
        assertThat(result.getPages()).isEqualTo(1);
    }

    @Test
    void pagedQueryKeepsTheCountFromMybatisPlus() {
        when(enterpriseMapper.selectPage(any(Page.class), any())).thenAnswer(invocation -> {
            Page<Enterprise> page = invocation.getArgument(0);
            page.setRecords(List.of());
            page.setTotal(42);
            return page;
        });
        EnterpriseQueryRequest request = new EnterpriseQueryRequest();
        request.setPageSize(10);

        assertThat(service.getEnterpriseList(request).getTotal()).isEqualTo(42);
    }
}
