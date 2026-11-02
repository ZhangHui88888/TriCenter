package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.Category;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseContact;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.entity.SystemOption;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/** 批量导出调研表：查询次数不能随企业数线性增长（以前 1080 家要跑好几分钟）。 */
class SurveyExcelBatchExportQueryCountTest {

    @Test
    void batchExportLoadsContactsAndProductsOnceAndDictionaryFromCache() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), EnterpriseProduct.class);
        EnterpriseMapper enterpriseMapper = mock(EnterpriseMapper.class);
        EnterpriseContactMapper contactMapper = mock(EnterpriseContactMapper.class);
        EnterpriseProductMapper productMapper = mock(EnterpriseProductMapper.class);
        CategoryMapper categoryMapper = mock(CategoryMapper.class);
        SystemOptionMapper optionMapper = mock(SystemOptionMapper.class);
        OptionsService optionsService = mock(OptionsService.class);
        DictionaryCacheService dictionary = mock(DictionaryCacheService.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(7);
        when(optionsService.getRequirementConfig()).thenReturn(new RequirementConfigResponse());

        List<Enterprise> enterprises = IntStream.rangeClosed(1, 30).mapToObj(i -> {
            Enterprise e = new Enterprise();
            e.setId(i);
            e.setName("企业" + i);
            e.setIndustryId(100);
            e.setStaffSizeId(200);
            e.setTradeModeId(300);
            return e;
        }).toList();
        when(enterpriseMapper.selectList(any())).thenReturn(enterprises);
        List<EnterpriseContact> contacts = new ArrayList<>();
        List<EnterpriseProduct> products = new ArrayList<>();
        for (Enterprise e : enterprises) {
            EnterpriseContact c = new EnterpriseContact();
            c.setEnterpriseId(e.getId());
            c.setName("联系人" + e.getId());
            c.setIsPrimary(1);
            contacts.add(c);
            EnterpriseProduct p = new EnterpriseProduct();
            p.setEnterpriseId(e.getId());
            p.setName("产品" + e.getId());
            p.setCategoryId(100);
            products.add(p);
        }
        when(contactMapper.selectByEnterpriseIds(anyList())).thenReturn(contacts);
        when(productMapper.selectList(any())).thenReturn(products);
        Category industry = new Category();
        industry.setId(100);
        industry.setName("家居用品");
        when(dictionary.getCategoryById(100)).thenReturn(industry);
        SystemOption option = new SystemOption();
        option.setLabel("10-50人");
        when(dictionary.getOptionById(anyInt())).thenReturn(option);

        SurveyExcelServiceImpl service = new SurveyExcelServiceImpl(enterpriseMapper, contactMapper,
                productMapper, categoryMapper, optionMapper, mock(ProviderMapper.class), optionsService,
                mock(RequirementMatchEngine.class), cityContext, mock(CityAccessService.class),
                mock(DashboardCacheInvalidator.class), mock(AuditOutboxService.class),
                mock(PlatformTransactionManager.class), dictionary);

        MockHttpServletResponse response = new MockHttpServletResponse();
        service.exportBatchSurveyExcel(enterprises.stream().map(Enterprise::getId).toList(), response);

        assertThat(response.getContentAsByteArray()).isNotEmpty();
        verify(contactMapper, times(1)).selectByEnterpriseIds(anyList());
        verify(contactMapper, never()).selectByEnterpriseId(any());
        verify(productMapper, times(1)).selectList(any());
        verify(optionMapper, never()).selectById(any());
        verify(categoryMapper, never()).selectById(any());
        verify(dictionary, atLeast(30)).getCategoryById(100);
    }
}
