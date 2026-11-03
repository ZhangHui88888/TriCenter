package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseContact;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/** 需求分析 Sheet 每个企业一列：导出全部企业（1080 家）不能是立方级耗时（线上曾跑十几分钟后 504）。 */
class SurveyExcelLargeExportTest {

    @Test
    void exportOf1080EnterprisesFinishesQuickly() throws Exception {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), EnterpriseProduct.class);
        EnterpriseMapper enterpriseMapper = mock(EnterpriseMapper.class);
        EnterpriseContactMapper contactMapper = mock(EnterpriseContactMapper.class);
        EnterpriseProductMapper productMapper = mock(EnterpriseProductMapper.class);
        OptionsService optionsService = mock(OptionsService.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(7);

        RequirementConfigResponse config = new RequirementConfigResponse();
        List<RequirementConfigResponse.RequirementItemDTO> requirements = new ArrayList<>();
        Set<String> requirementIds = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            RequirementConfigResponse.RequirementItemDTO r = new RequirementConfigResponse.RequirementItemDTO();
            r.setId("R" + i);
            r.setName("需求" + i);
            r.setPhase("阶段");
            r.setCategory("分类");
            r.setDescription("要点说明要点说明");
            r.setDetailDescription("具体说明具体说明具体说明具体说明");
            requirements.add(r);
            requirementIds.add(r.getId());
        }
        config.setRequirements(requirements);
        when(optionsService.getRequirementConfig()).thenReturn(config);
        RequirementMatchEngine matchEngine = mock(RequirementMatchEngine.class);
        when(matchEngine.calculateEffectiveRequirementIds(any(), any(), any(), any())).thenReturn(requirementIds);

        List<Enterprise> enterprises = IntStream.rangeClosed(1, 1080).mapToObj(i -> {
            Enterprise e = new Enterprise();
            e.setId(i);
            e.setName("常州某某科技有限公司" + i);
            return e;
        }).toList();
        when(enterpriseMapper.selectList(any())).thenReturn(enterprises);
        List<EnterpriseContact> contacts = new ArrayList<>();
        for (Enterprise e : enterprises) {
            EnterpriseContact c = new EnterpriseContact();
            c.setEnterpriseId(e.getId());
            c.setName("张三"); // is_primary 留空：导出不能因此报错
            contacts.add(c);
        }
        when(contactMapper.selectByEnterpriseIds(anyList())).thenReturn(contacts);
        when(productMapper.selectList(any())).thenReturn(List.of());

        SurveyExcelServiceImpl service = new SurveyExcelServiceImpl(enterpriseMapper, contactMapper,
                productMapper, mock(CategoryMapper.class), mock(SystemOptionMapper.class), mock(ProviderMapper.class),
                optionsService, matchEngine, cityContext, mock(CityAccessService.class),
                mock(DashboardCacheInvalidator.class), mock(AuditOutboxService.class),
                mock(PlatformTransactionManager.class), mock(DictionaryCacheService.class));

        long start = System.nanoTime();
        MockHttpServletResponse response = new MockHttpServletResponse();
        service.exportBatchSurveyExcel(enterprises.stream().map(Enterprise::getId).toList(), response);
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;

        assertThat(response.getContentAsByteArray()).isNotEmpty();
        // 修复前 400 家就要 80 秒；修复后 1080 家不到 1 秒，阈值留足余量防机器抖动
        assertThat(elapsedMs).isLessThan(20_000);
    }
}
