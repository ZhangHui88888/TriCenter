package com.tricenter.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.dto.excel.*;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.Enterprise;
import com.tricenter.mapper.*;
import com.tricenter.security.CityContext;
import com.tricenter.security.LoginUser;
import com.tricenter.service.*;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EnterpriseStageImportTest {
    private EnterpriseMapper enterpriseMapper;
    private CityAccessService cityAccessService;
    private OptionsService optionsService;
    private DashboardCacheInvalidator cacheInvalidator;
    private SurveyExcelServiceImpl surveyService;
    private EnterpriseServiceImpl enterpriseService;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Enterprise.class);
        enterpriseMapper = mock(EnterpriseMapper.class);
        cityAccessService = mock(CityAccessService.class);
        optionsService = mock(OptionsService.class);
        cacheInvalidator = mock(DashboardCacheInvalidator.class);
        CityContext cityContext = mock(CityContext.class);
        when(cityContext.requireCityId()).thenReturn(1);
        when(cityContext.requireLoginUser()).thenReturn(new LoginUser(1, "tester", "ADMIN", 1, false));
        City city = new City();
        city.setName("常州");
        when(cityAccessService.requireActiveCity(1)).thenReturn(city);
        when(enterpriseMapper.insert(any(Enterprise.class))).thenAnswer(invocation -> {
            Enterprise enterprise = invocation.getArgument(0);
            enterprise.setId(100);
            return 1;
        });
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        when(transactionManager.getTransaction(any(TransactionDefinition.class)))
                .thenReturn(mock(TransactionStatus.class));
        surveyService = new SurveyExcelServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(CategoryMapper.class), mock(SystemOptionMapper.class),
                mock(ProviderMapper.class),
                optionsService, mock(RequirementMatchEngine.class), cityContext, cityAccessService,
                cacheInvalidator, mock(AuditOutboxService.class), transactionManager);
        enterpriseService = new EnterpriseServiceImpl(enterpriseMapper, mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(EnterprisePatentMapper.class), mock(CategoryMapper.class),
                mock(StageChangeLogMapper.class), mock(FollowUpRecordMapper.class), cacheInvalidator,
                mock(DictionaryCacheService.class), mock(RequirementMatchEngine.class), optionsService,
                mock(ProviderMapper.class),
                cityContext, cityAccessService);
    }

    @ParameterizedTest
    @CsvSource({"潜在企业,POTENTIAL", "无明确需求,NO_DEMAND", "没有合作意向,NO_INTENTION",
            "有明确需求,HAS_DEMAND", "已签约,SIGNED", "已入驻,SETTLED", "重点孵化,INCUBATING",
            "' signed ',SIGNED", "'  已签约  ',SIGNED", "'',POTENTIAL"})
    void surveyImportPersistsStageFromExcel(String value, String expected) {
        ImportResultResponse result = surveyService.importSurveyExcel(surveyFile(List.of(basic("测试企业", value))));

        assertThat(result.getSuccess()).isEqualTo(1);
        assertThat(result.getErrors()).isEmpty();
        ArgumentCaptor<Enterprise> saved = ArgumentCaptor.forClass(Enterprise.class);
        verify(enterpriseMapper).insert(saved.capture());
        assertThat(saved.getValue().getStage()).isEqualTo(expected);
        verify(cacheInvalidator).evictAfterCommit();
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void surveyReimportUpdatesExistingEnterpriseByIdOrName(boolean useId) {
        Enterprise existing = new Enterprise();
        existing.setId(42);
        existing.setName("测试企业");
        existing.setStage("POTENTIAL");
        SurveyBasicInfoData row = basic("测试企业", "已签约");
        if (useId) {
            row.setEnterpriseId(42);
            when(cityAccessService.requireEnterprise(42, 1)).thenReturn(existing);
        } else {
            when(enterpriseMapper.selectOne(any())).thenReturn(existing);
        }

        ImportResultResponse result = surveyService.importSurveyExcel(surveyFile(List.of(row)));

        assertThat(result.getSuccess()).isEqualTo(1);
        verify(enterpriseMapper).updateById(existing);
        verify(enterpriseMapper, never()).insert(any(Enterprise.class));
        assertThat(existing.getStage()).isEqualTo("SIGNED");
    }

    @Test
    void blankStagePreservesExistingStage() {
        Enterprise existing = new Enterprise();
        existing.setId(42);
        existing.setName("测试企业");
        existing.setStage("SETTLED");
        when(enterpriseMapper.selectOne(any())).thenReturn(existing);

        ImportResultResponse result = surveyService.importSurveyExcel(surveyFile(List.of(basic("测试企业", "  "))));

        assertThat(result.getSuccess()).isEqualTo(1);
        assertThat(existing.getStage()).isEqualTo("SETTLED");
        verify(enterpriseMapper).updateById(existing);
    }

    @Test
    void surveyBatchKeepsAllSignedStagesAndReportsInvalidStage() {
        List<SurveyBasicInfoData> rows = new ArrayList<>();
        rows.add(basic("【请勿修改企业ID】", "【仅展示，勿修改】"));
        rows.add(basic("示例：测试企业", "潜在企业"));
        for (int i = 0; i < 125; i++) rows.add(basic("已签约企业" + i, "已签约"));
        rows.add(basic("错误阶段企业", "签约中"));

        ImportResultResponse result = surveyService.importSurveyExcel(surveyFile(rows));

        assertThat(result.getSuccess()).isEqualTo(125);
        assertThat(result.getFailed()).isEqualTo(1);
        assertThat(result.getErrors()).singleElement().satisfies(error ->
                assertThat(error.getMessage()).contains("错误阶段企业", "无法识别漏斗阶段", "签约中"));
        ArgumentCaptor<Enterprise> saved = ArgumentCaptor.forClass(Enterprise.class);
        verify(enterpriseMapper, times(125)).insert(saved.capture());
        assertThat(saved.getAllValues()).allSatisfy(enterprise -> assertThat(enterprise.getStage()).isEqualTo("SIGNED"));
    }

    @Test
    void invalidStageDoesNotUpdateExistingEnterprise() {
        Enterprise existing = new Enterprise();
        existing.setId(42);
        existing.setStage("SETTLED");
        when(enterpriseMapper.selectOne(any())).thenReturn(existing);

        ImportResultResponse result = surveyService.importSurveyExcel(surveyFile(List.of(basic("测试企业", "签约中"))));

        assertThat(result.getFailed()).isEqualTo(1);
        verify(enterpriseMapper, never()).updateById(any(Enterprise.class));
        assertThat(existing.getStage()).isEqualTo("SETTLED");
    }

    @ParameterizedTest
    @CsvSource({"已签约,SIGNED", "' signed ',SIGNED", "'',POTENTIAL", "签约中,INVALID"})
    void simpleImportAlsoReadsAndValidatesStage(String value, String expected) {
        EnterpriseExcelData row = new EnterpriseExcelData();
        row.setName("测试企业");
        row.setDistrict("武进区");
        row.setEnterpriseType("工贸一体");
        row.setStageName(value);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        EasyExcel.write(output, EnterpriseExcelData.class).sheet("企业列表").doWrite(List.of(row));

        ImportResultResponse result = enterpriseService.importEnterprises(file(output));

        if ("INVALID".equals(expected)) {
            assertThat(result.getFailed()).isEqualTo(1);
            assertThat(result.getErrors()).singleElement().satisfies(error ->
                    assertThat(error.getMessage()).contains("无法识别漏斗阶段"));
            verify(enterpriseMapper, never()).insert(any(Enterprise.class));
        } else {
            assertThat(result.getSuccess()).isEqualTo(1);
            ArgumentCaptor<Enterprise> saved = ArgumentCaptor.forClass(Enterprise.class);
            verify(enterpriseMapper).insert(saved.capture());
            assertThat(saved.getValue().getStage()).isEqualTo(expected);
        }
    }

    @Test
    void templateExplainsStageImportInHintAndGuide() throws Exception {
        when(optionsService.getRequirementConfig()).thenReturn(new RequirementConfigResponse());
        MockHttpServletResponse response = new MockHttpServletResponse();
        surveyService.downloadTemplate(response);

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(response.getContentAsByteArray()))) {
            String hint = workbook.getSheet("企业基本信息").getRow(1).getCell(16).getStringCellValue();
            assertThat(hint).contains("已签约", "留空保留原阶段").doesNotContain("勿修改");
            boolean foundStageGuide = false;
            for (var row : workbook.getSheet("填写说明")) {
                if ("漏斗阶段".equals(row.getCell(0).getStringCellValue())) {
                    assertThat(row.getCell(3).getStringCellValue()).contains("已签约");
                    foundStageGuide = true;
                }
            }
            assertThat(foundStageGuide).isTrue();
        }
    }

    private SurveyBasicInfoData basic(String name, String stage) {
        SurveyBasicInfoData row = new SurveyBasicInfoData();
        row.setName(name);
        row.setDistrict("武进区");
        row.setEnterpriseType("工贸一体");
        row.setStageName(stage);
        return row;
    }

    private MockMultipartFile surveyFile(List<SurveyBasicInfoData> rows) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ExcelWriter writer = EasyExcel.write(output).build();
        try {
            writer.write(rows, EasyExcel.writerSheet(0, "企业基本信息").head(SurveyBasicInfoData.class).build());
            Class<?>[] types = {SurveyContactData.class, SurveyProductData.class, SurveyTradeData.class,
                    SurveyCrossBorderData.class, SurveyCooperationData.class};
            String[] names = {"联系人信息", "产品信息", "外贸信息", "跨境电商信息", "合作与政策信息"};
            for (int i = 0; i < types.length; i++) {
                writer.write(List.of(), EasyExcel.writerSheet(i + 1, names[i]).head(types[i]).build());
            }
        } finally {
            writer.finish();
        }
        return file(output);
    }

    private MockMultipartFile file(ByteArrayOutputStream output) {
        return new MockMultipartFile("file", "import.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
    }
}
