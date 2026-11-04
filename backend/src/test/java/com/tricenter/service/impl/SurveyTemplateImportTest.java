package com.tricenter.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.dto.excel.*;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.security.LoginUser;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import java.io.ByteArrayOutputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 业务人员按模板填写新企业（只填名称、区域、阶段，空格写“缺失”）后导入：
 * 每个 Sheet 的提示行、示例行要跳过，企业类型留空时按“未定义”新建。
 */
class SurveyTemplateImportTest {
    private EnterpriseMapper enterpriseMapper;
    private SurveyExcelServiceImpl service;
    private Enterprise inserted;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), EnterpriseProduct.class);
        enterpriseMapper = mock(EnterpriseMapper.class);
        CityAccessService cityAccessService = mock(CityAccessService.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(1);
        when(cityContext.requireLoginUser()).thenReturn(new LoginUser(1, "tester", "ADMIN", 1, false));
        City city = new City();
        city.setName("常州");
        when(cityAccessService.requireActiveCity(1)).thenReturn(city);
        when(cityAccessService.requireEnterprise(100, 1)).thenAnswer(invocation -> inserted);
        when(enterpriseMapper.insert(any(Enterprise.class))).thenAnswer(invocation -> {
            Enterprise enterprise = invocation.getArgument(0);
            inserted = enterprise;
            enterprise.setId(100);
            return 1;
        });
        when(enterpriseMapper.selectById(100)).thenAnswer(invocation -> inserted);
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        when(transactionManager.getTransaction(any(TransactionDefinition.class)))
                .thenReturn(mock(TransactionStatus.class));
        service = new SurveyExcelServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(CategoryMapper.class), mock(SystemOptionMapper.class),
                mock(ProviderMapper.class), mock(OptionsService.class), mock(RequirementMatchEngine.class),
                cityContext, cityAccessService, mock(DashboardCacheInvalidator.class),
                mock(AuditOutboxService.class), transactionManager, mock(DictionaryCacheService.class));
    }

    @Test
    void newEnterpriseWithOnlyNameDistrictAndStageImportsFromFilledTemplate() {
        SurveyBasicInfoData basicHint = new SurveyBasicInfoData();
        basicHint.setName("【请勿修改企业ID】");
        SurveyBasicInfoData basicExample = new SurveyBasicInfoData();
        basicExample.setName("示例：常州XX科技有限公司");
        basicExample.setDistrict("武进区");
        basicExample.setEnterpriseType("工贸一体");
        SurveyBasicInfoData basic = new SurveyBasicInfoData();
        basic.setName("常州铎屿信息科技有限公司");
        basic.setDistrict("天宁区");
        basic.setStageName("已签约");

        SurveyTradeData tradeHint = new SurveyTradeData();
        tradeHint.setEnterpriseName("【请勿修改企业ID】");
        tradeHint.setTradeTeamSize("填数字");
        SurveyTradeData tradeExample = new SurveyTradeData();
        tradeExample.setEnterpriseName("示例：常州XX科技有限公司");
        tradeExample.setTradeTeamSize("8");
        SurveyTradeData trade = new SurveyTradeData();
        trade.setEnterpriseName("常州铎屿信息科技有限公司");
        trade.setTradeTeamSize("缺失");
        trade.setLastYearRevenue("缺失");

        SurveyCrossBorderData crossBorder = new SurveyCrossBorderData();
        crossBorder.setEnterpriseName("常州铎屿信息科技有限公司");
        crossBorder.setCrossBorderTeamSize(" 缺失 ");

        ImportResultResponse result = service.importSurveyExcel(surveyFile(
                List.of(basicHint, basicExample, basic),
                List.of(tradeHint, tradeExample, trade),
                List.of(crossBorder)));

        assertThat(result.getErrors()).isEmpty();
        assertThat(result.getSuccess()).isEqualTo(1);
        assertThat(result.getFailed()).isZero();
        ArgumentCaptor<Enterprise> saved = ArgumentCaptor.forClass(Enterprise.class);
        verify(enterpriseMapper).insert(saved.capture());
        assertThat(saved.getValue().getName()).isEqualTo("常州铎屿信息科技有限公司");
        assertThat(saved.getValue().getEnterpriseType()).isEqualTo("未定义");
        assertThat(saved.getValue().getStage()).isEqualTo("SIGNED");
    }

    private MockMultipartFile surveyFile(List<SurveyBasicInfoData> basics, List<SurveyTradeData> trades,
                                         List<SurveyCrossBorderData> crossBorders) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ExcelWriter writer = EasyExcel.write(output).build();
        try {
            writer.write(basics, EasyExcel.writerSheet(0, "企业基本信息").head(SurveyBasicInfoData.class).build());
            writer.write(List.of(), EasyExcel.writerSheet(1, "联系人信息").head(SurveyContactData.class).build());
            writer.write(List.of(), EasyExcel.writerSheet(2, "产品信息").head(SurveyProductData.class).build());
            writer.write(trades, EasyExcel.writerSheet(3, "外贸信息").head(SurveyTradeData.class).build());
            writer.write(crossBorders, EasyExcel.writerSheet(4, "跨境电商信息").head(SurveyCrossBorderData.class).build());
            writer.write(List.of(), EasyExcel.writerSheet(5, "合作与政策信息").head(SurveyCooperationData.class).build());
        } finally {
            writer.finish();
        }
        return new MockMultipartFile("file", "import.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
    }
}
