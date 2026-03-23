package com.tricenter.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.excel.*;
import com.tricenter.dto.response.ImportResultResponse;
import com.tricenter.dto.response.RequirementConfigResponse;
import com.tricenter.entity.*;
import com.tricenter.mapper.*;
import com.tricenter.service.SurveyExcelService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.tricenter.config.SurveyExcelStyleHandler;
import com.tricenter.service.OptionsService;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 调研Excel导入导出服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SurveyExcelServiceImpl implements SurveyExcelService {

    private final EnterpriseMapper enterpriseMapper;
    private final EnterpriseContactMapper contactMapper;
    private final EnterpriseProductMapper productMapper;
    private final EnterprisePatentMapper patentMapper;
    private final IndustryCategoryMapper industryCategoryMapper;
    private final ProductCategoryMapper productCategoryMapper;
    private final SystemOptionMapper systemOptionMapper;
    private final OptionsService optionsService;

    // ==================== 导出 ====================

    @Override
    public void exportSurveyExcel(Integer enterpriseId, HttpServletResponse response) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw BusinessException.notFound("企业不存在");
        }
        exportToResponse(Collections.singletonList(enterprise), enterprise.getName() + "_调研表", response);
    }

    @Override
    public void exportBatchSurveyExcel(List<Integer> enterpriseIds, HttpServletResponse response) {
        List<Enterprise> enterprises = new ArrayList<>();
        for (Integer id : enterpriseIds) {
            Enterprise e = enterpriseMapper.selectById(id);
            if (e != null && e.getIsDeleted() != 1) {
                enterprises.add(e);
            }
        }
        if (enterprises.isEmpty()) {
            throw BusinessException.badRequest("没有可导出的企业");
        }
        exportToResponse(enterprises, "企业调研表_批量", response);
    }

    @Override
    public void downloadTemplate(HttpServletResponse response) {
        LambdaQueryWrapper<Enterprise> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Enterprise::getIsDeleted, 0)
                .orderByAsc(Enterprise::getId);
        List<Enterprise> enterprises = enterpriseMapper.selectList(wrapper);
        if (enterprises.isEmpty()) {
            throw BusinessException.badRequest("系统中暂无企业数据，请先创建企业后再下载模板");
        }
        exportToResponse(enterprises, "调研导入模板", response);
    }

    private void exportToResponse(List<Enterprise> enterprises, String fileNamePrefix, HttpServletResponse response) {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode(fileNamePrefix, "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            // 从数据库加载所有选项，用于填写提示
            Map<String, List<String>> optionLabels = loadAllOptionLabels();

            ExcelWriter writer = EasyExcel.write(response.getOutputStream())
                    .registerWriteHandler(new SurveyExcelStyleHandler())
                    .build();

            // Sheet0: 填写说明（放在最前面）
            WriteSheet guideSheet = EasyExcel.writerSheet(0, "填写说明")
                    .head(buildGuideHead())
                    .registerWriteHandler(new com.alibaba.excel.write.handler.SheetWriteHandler() {
                        @Override
                        public void afterSheetCreate(com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder wbh, com.alibaba.excel.write.metadata.holder.WriteSheetHolder wsh) {
                            org.apache.poi.ss.usermodel.Sheet sheet = wsh.getSheet();
                            sheet.setColumnWidth(0, 18 * 256);  // 字段名称
                            sheet.setColumnWidth(1, 16 * 256);  // 所在Sheet
                            sheet.setColumnWidth(2, 40 * 256);  // 填写要求
                            sheet.setColumnWidth(3, 80 * 256);  // 可选值
                        }
                    })
                    .build();
            writer.write(buildGuideData(optionLabels), guideSheet);

            // 隐藏企业ID列的处理器（所有数据Sheet共用）
            com.alibaba.excel.write.handler.SheetWriteHandler hideIdColumnHandler = new com.alibaba.excel.write.handler.SheetWriteHandler() {
                @Override
                public void afterSheetCreate(com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder wbh, com.alibaba.excel.write.metadata.holder.WriteSheetHolder wsh) {
                    wsh.getSheet().setColumnHidden(0, true);
                }
            };

            // Sheet1: 企业基本信息
            WriteSheet sheet1 = EasyExcel.writerSheet(1, "企业基本信息")
                    .head(SurveyBasicInfoData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyBasicInfoData> basicData = buildBasicInfoData(enterprises);
            SurveyBasicInfoData basicHint = new SurveyBasicInfoData();
            basicHint.setEnterpriseId(null);
            basicHint.setName("【请勿修改企业ID】");
            basicHint.setCreditCode("18位");
            basicHint.setDistrict("可选：" + String.join("/", optionLabels.getOrDefault("district", List.of())));
            basicHint.setAddress("自由填写");
            basicHint.setIndustryName("按系统行业分类填写");
            basicHint.setEnterpriseType("可选：" + String.join("/", optionLabels.getOrDefault("enterprise_type", List.of())));
            basicHint.setStaffSize("可选：" + String.join("/", optionLabels.getOrDefault("staff_size", List.of())));
            basicHint.setWebsite("自由填写");
            basicHint.setDomesticRevenue("可选：" + String.join("/", optionLabels.getOrDefault("domestic_revenue", List.of())));
            basicHint.setCrossBorderRevenue("填数字，单位万元（如 350）；或沿用旧版档位：" + String.join("/", optionLabels.getOrDefault("cross_border_revenue", List.of())));
            basicHint.setSource("可选：" + String.join("/", optionLabels.getOrDefault("source", List.of())));
            basicHint.setHasOwnBrand("填：是/否");
            basicHint.setBrandNames("自由填写，多个用逗号分隔");
            basicHint.setStageName("【仅展示，勿修改】");
            // 示例行
            SurveyBasicInfoData basicExample = new SurveyBasicInfoData();
            basicExample.setEnterpriseId(null);
            basicExample.setName("示例：常州XX科技有限公司");
            basicExample.setCreditCode("91320400MA1XXXXX0X");
            basicExample.setDistrict("武进区");
            basicExample.setAddress("常州市武进区XX路88号");
            basicExample.setIndustryName("园艺制品");
            basicExample.setEnterpriseType("工贸一体");
            basicExample.setStaffSize("50-200人");
            basicExample.setWebsite("https://www.example.com");
            basicExample.setDomesticRevenue("1000-5000");
            basicExample.setCrossBorderRevenue("350");
            basicExample.setSource("调研");
            basicExample.setHasOwnBrand("是");
            basicExample.setBrandNames("品牌A,品牌B");
            basicExample.setStageName("潜在企业");
            basicData.add(0, basicHint);
            basicData.add(1, basicExample);
            writer.write(basicData, sheet1);

            // Sheet2: 联系人信息
            WriteSheet sheet2 = EasyExcel.writerSheet(2, "联系人信息")
                    .head(SurveyContactData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyContactData> contactData = buildContactData(enterprises);
            SurveyContactData contactHint = new SurveyContactData();
            contactHint.setEnterpriseId(null);
            contactHint.setEnterpriseName("【请勿修改企业ID】");
            contactHint.setName("必填");
            contactHint.setPhone("手机号");
            contactHint.setPosition("自由填写");
            contactHint.setEmail("自由填写");
            contactHint.setWechat("自由填写");
            contactHint.setIsPrimary("填：是/否");
            contactHint.setRemark("自由填写");
            SurveyContactData contactExample = new SurveyContactData();
            contactExample.setEnterpriseId(null);
            contactExample.setEnterpriseName("示例：常州XX科技有限公司");
            contactExample.setName("张三");
            contactExample.setPhone("13800138000");
            contactExample.setPosition("总经理");
            contactExample.setEmail("zhangsan@example.com");
            contactExample.setWechat("zhangsan_wx");
            contactExample.setIsPrimary("是");
            contactExample.setRemark("主要对接人");
            contactData.add(0, contactHint);
            contactData.add(1, contactExample);
            writer.write(contactData, sheet2);

            // Sheet3: 产品信息
            WriteSheet sheet3 = EasyExcel.writerSheet(3, "产品信息")
                    .head(SurveyProductData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyProductData> productData = buildProductData(enterprises);
            SurveyProductData productHint = new SurveyProductData();
            productHint.setEnterpriseId(null);
            productHint.setEnterpriseName("【请勿修改企业ID】");
            productHint.setName("必填");
            productHint.setCategoryName("按系统品类填写");
            productHint.setCertifications("多选用顿号分隔");
            productHint.setTargetRegions("多选用顿号分隔");
            productHint.setAnnualSales("自由填写");
            productHint.setLocalProcurementRatio("如：80%");
            productHint.setAutomationLevel("可选：" + String.join("/", optionLabels.getOrDefault("automation_level", List.of())));
            productHint.setAnnualCapacity("自由填写");
            productHint.setTargetCountries("多选用顿号分隔");
            productHint.setLogisticsPartners("多选用顿号分隔");
            SurveyProductData productExample = new SurveyProductData();
            productExample.setEnterpriseId(null);
            productExample.setEnterpriseName("示例：常州XX科技有限公司");
            productExample.setName("智能花盆");
            productExample.setCategoryName("园艺用品");
            List<String> certLabels = optionLabels.getOrDefault("certification", List.of());
            productExample.setCertifications(certLabels.size() >= 2 ? certLabels.get(0) + "、" + certLabels.get(1) : "CE认证、ISO9001");
            List<String> regionLabels = optionLabels.getOrDefault("region", List.of());
            productExample.setTargetRegions(regionLabels.size() >= 3 ? regionLabels.get(0) + "、" + regionLabels.get(1) + "、" + regionLabels.get(2) : "北美、欧洲、东南亚");
            productExample.setTargetCountries("美国、德国、日本");
            productExample.setAnnualSales("500万");
            productExample.setLocalProcurementRatio("70%");
            List<String> autoLabels = optionLabels.getOrDefault("automation_level", List.of());
            productExample.setAutomationLevel(autoLabels.isEmpty() ? "半自动化" : autoLabels.get(0));
            productExample.setAnnualCapacity("100万件");
            productExample.setLogisticsPartners("DHL、顺丰");
            productData.add(0, productHint);
            productData.add(1, productExample);
            writer.write(productData, sheet3);

            // Sheet4: 外贸信息
            WriteSheet sheet4 = EasyExcel.writerSheet(4, "外贸信息")
                    .head(SurveyTradeData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyTradeData> tradeData = buildTradeData(enterprises);
            SurveyTradeData tradeHint = new SurveyTradeData();
            tradeHint.setEnterpriseId(null);
            tradeHint.setEnterpriseName("【请勿修改企业ID】");
            tradeHint.setTargetRegions("多选用顿号分隔");
            tradeHint.setTargetCountries("多选用顿号分隔");
            tradeHint.setTradeMode("可选：" + String.join("/", optionLabels.getOrDefault("trade_mode", List.of())));
            tradeHint.setHasImportExportLicense("填：是/否");
            tradeHint.setCustomsDeclarationMode("自由填写");
            tradeHint.setTradeTeamMode("可选：" + String.join("/", optionLabels.getOrDefault("trade_team_mode", List.of())));
            tradeHint.setTradeTeamSize("填数字");
            tradeHint.setHasDomesticEcommerce("填：是/否");
            tradeHint.setLastYearRevenue("填数字(万元)");
            tradeHint.setYearBeforeLastRevenue("填数字(万元)");
            tradeHint.setGrowthMarkets("格式：市场名 +变化率，多个用顿号分隔");
            tradeHint.setDeclineMarkets("格式：市场名 -变化率，多个用顿号分隔");
            tradeHint.setGrowthModes("格式：模式名 +变化率，多个用顿号分隔");
            tradeHint.setDeclineModes("格式：模式名 -变化率，多个用顿号分隔");
            tradeHint.setGrowthCategories("格式：品类名 +变化率，多个用顿号分隔");
            tradeHint.setDeclineCategories("格式：品类名 -变化率，多个用顿号分隔");
            tradeHint.setGrowthReasons("多个用顿号分隔");
            tradeHint.setDeclineReasons("多个用顿号分隔");
            SurveyTradeData tradeExample = new SurveyTradeData();
            tradeExample.setEnterpriseId(null);
            tradeExample.setEnterpriseName("示例：常州XX科技有限公司");
            tradeExample.setTargetRegions(regionLabels.size() >= 2 ? regionLabels.get(0) + "、" + regionLabels.get(1) : "北美、欧洲");
            tradeExample.setTargetCountries("美国、德国");
            List<String> tmLabels = optionLabels.getOrDefault("trade_mode", List.of());
            tradeExample.setTradeMode(tmLabels.isEmpty() ? "OEM代工" : tmLabels.get(0));
            tradeExample.setHasImportExportLicense("是");
            tradeExample.setCustomsDeclarationMode("自营报关");
            List<String> ttmLabels = optionLabels.getOrDefault("trade_team_mode", List.of());
            tradeExample.setTradeTeamMode(ttmLabels.isEmpty() ? "自建团队" : ttmLabels.get(0));
            tradeExample.setTradeTeamSize("8");
            tradeExample.setHasDomesticEcommerce("是");
            tradeExample.setLastYearRevenue("3500");
            tradeExample.setYearBeforeLastRevenue("2800");
            tradeExample.setGrowthMarkets("东南亚 +25%、中东 +18%、南美 +12%");
            tradeExample.setDeclineMarkets("欧洲 -8%、北美 -5%");
            tradeExample.setGrowthModes("跨境电商B2C +35%、海外仓直发 +22%");
            tradeExample.setDeclineModes("传统B2B -10%");
            tradeExample.setGrowthCategories("园艺工具 +28%、户外家具 +20%、智能灌溉 +45%");
            tradeExample.setDeclineCategories("传统手工具 -15%、塑料花盆 -8%");
            tradeExample.setGrowthReasons("东南亚市场需求旺盛、跨境电商渠道拓展成功、新产品线上市表现良好");
            tradeExample.setDeclineReasons("欧美市场竞争加剧、传统B2B订单减少、部分品类价格下降");
            tradeData.add(0, tradeHint);
            tradeData.add(1, tradeExample);
            writer.write(tradeData, sheet4);

            // Sheet5: 跨境电商信息
            WriteSheet sheet5 = EasyExcel.writerSheet(5, "跨境电商信息")
                    .head(SurveyCrossBorderData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyCrossBorderData> cbData = buildCrossBorderData(enterprises);
            SurveyCrossBorderData cbHint = new SurveyCrossBorderData();
            cbHint.setEnterpriseId(null);
            cbHint.setEnterpriseName("【请勿修改企业ID】");
            cbHint.setHasCrossBorder("填：是/否");
            cbHint.setCrossBorderPlatforms("多选用顿号分隔");
            cbHint.setCrossBorderRatio("如：25%");
            cbHint.setCrossBorderLogistics("多选用顿号分隔");
            cbHint.setPaymentSettlement("多选用顿号分隔");
            cbHint.setCrossBorderTeamSize("填数字");
            cbHint.setUsingErp("填：是/否");
            cbHint.setHasOverseasDistributors("填：是/否");
            cbHint.setTransformationWillingness("可选：高/中/低");
            cbHint.setInvestmentWillingness("可选：高/中/低");
            cbHint.setTargetMarkets("格式：市场名 占比%，多个用顿号分隔");
            SurveyCrossBorderData cbExample = new SurveyCrossBorderData();
            cbExample.setEnterpriseId(null);
            cbExample.setEnterpriseName("示例：常州XX科技有限公司");
            cbExample.setHasCrossBorder("是");
            List<String> platLabels = optionLabels.getOrDefault("cross_border_platform", List.of());
            cbExample.setCrossBorderPlatforms(platLabels.size() >= 3 ? platLabels.get(0) + "、" + platLabels.get(1) + "、" + platLabels.get(2) : "亚马逊、阿里国际站、TikTok Shop");
            cbExample.setCrossBorderRatio("30%");
            List<String> logLabels = optionLabels.getOrDefault("cross_border_logistics", List.of());
            cbExample.setCrossBorderLogistics(logLabels.size() >= 2 ? logLabels.get(0) + "、" + logLabels.get(1) : "海运、FBA");
            List<String> payLabels = optionLabels.getOrDefault("payment_settlement", List.of());
            cbExample.setPaymentSettlement(payLabels.size() >= 2 ? payLabels.get(0) + "、" + payLabels.get(1) : "T/T电汇、PayPal");
            cbExample.setCrossBorderTeamSize("5");
            cbExample.setUsingErp("是（用友U8）");
            cbExample.setHasOverseasDistributors("否");
            cbExample.setTransformationWillingness("高");
            cbExample.setInvestmentWillingness("高");
            cbExample.setTargetMarkets("北美 40%、欧洲 30%、东南亚 20%、其他 10%");
            cbData.add(0, cbHint);
            cbData.add(1, cbExample);
            writer.write(cbData, sheet5);

            // Sheet6: 合作与政策信息
            WriteSheet sheet6 = EasyExcel.writerSheet(6, "合作与政策信息")
                    .head(SurveyCooperationData.class)
                    .registerWriteHandler(hideIdColumnHandler).build();
            List<SurveyCooperationData> coopData = buildCooperationData(enterprises);
            SurveyCooperationData coopHint = new SurveyCooperationData();
            coopHint.setEnterpriseId(null);
            coopHint.setEnterpriseName("【请勿修改企业ID】");
            coopHint.setServiceCooperationRating("填1-5的数字");
            coopHint.setInvestmentCooperationRating("填1-5的数字");
            coopHint.setIncubationCooperationRating("填1-5的数字");
            coopHint.setBrandCooperationRating("填1-5的数字");
            coopHint.setTrainingCooperationRating("填1-5的数字");
            coopHint.setOverallCooperationRating("填1-5的数字");
            coopHint.setBenchmarkPossibility("填0-100的数字");
            coopHint.setHasPolicySupport("填：是/否");
            coopHint.setEnjoyedPolicies("多选用顿号分隔");
            coopHint.setSurveyDate("如：2024-01-15");
            coopHint.setSurveyStaff("自由填写");
            coopHint.setCompetitionPosition("可选：头部企业/中型企业/初创企业");
            coopHint.setCompetitionDescription("自由填写");
            coopHint.setCurrentRisks("多选用顿号分隔");
            coopHint.setRiskDescription("自由填写");
            coopHint.setAdditionalNotes("自由填写");
            coopHint.setSuggestions("自由填写");
            SurveyCooperationData coopExample = new SurveyCooperationData();
            coopExample.setEnterpriseId(null);
            coopExample.setEnterpriseName("示例：常州XX科技有限公司");
            coopExample.setServiceCooperationRating("4");
            coopExample.setInvestmentCooperationRating("3");
            coopExample.setIncubationCooperationRating("5");
            coopExample.setBrandCooperationRating("4");
            coopExample.setTrainingCooperationRating("3");
            coopExample.setOverallCooperationRating("4");
            coopExample.setBenchmarkPossibility("75");
            coopExample.setHasPolicySupport("是");
            List<String> policyLabels = optionLabels.getOrDefault("enjoyed_policy", List.of());
            coopExample.setEnjoyedPolicies(policyLabels.size() >= 2 ? policyLabels.get(0) + "、" + policyLabels.get(1) : "出口退税、跨境电商补贴");
            coopExample.setSurveyDate("2024-01-15");
            coopExample.setSurveyStaff("张明、李华");
            coopExample.setCompetitionPosition("中型企业");
            coopExample.setCompetitionDescription("在园艺制品领域具有较强竞争力");
            coopExample.setCurrentRisks("原材料价格波动风险、跨境物流成本上涨、人才流失风险");
            coopExample.setRiskDescription("原材料价格波动较大，物流成本持续上升");
            coopExample.setAdditionalNotes("该企业为常州园艺制品行业优质企业");
            coopExample.setSuggestions("优先安排亚马逊招商经理对接、推荐参加跨境电商培训班");
            coopData.add(0, coopHint);
            coopData.add(1, coopExample);
            writer.write(coopData, sheet6);

            // Sheet7: 需求分析（转置矩阵：每行一条需求、每列一个企业）
            RequirementConfigResponse reqConfig = optionsService.getRequirementConfig();
            List<RequirementConfigResponse.RequirementItemDTO> allReqs = reqConfig.getRequirements() != null
                    ? reqConfig.getRequirements()
                    : List.of();
            // 构建四级表头：左侧固定为需求信息，右侧每列一个企业
            List<List<String>> reqHead = new ArrayList<>();
            reqHead.add(Arrays.asList("需求信息", "需求信息", "需求阶段", "需求阶段"));
            reqHead.add(Arrays.asList("需求信息", "需求信息", "需求分类", "需求分类"));
            reqHead.add(Arrays.asList("需求信息", "需求信息", "需求ID", "需求ID"));
            reqHead.add(Arrays.asList("需求信息", "需求信息", "需求名称", "需求名称"));
            for (Enterprise e : enterprises) {
                reqHead.add(Arrays.asList("企业信息", "企业信息", "企业名称", e.getName()));
            }

            // 需求分析Sheet专用样式处理器：设置列宽和表头行高
            com.alibaba.excel.write.handler.SheetWriteHandler reqSheetHandler = new com.alibaba.excel.write.handler.SheetWriteHandler() {
                @Override
                public void afterSheetCreate(com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder wbh, com.alibaba.excel.write.metadata.holder.WriteSheetHolder wsh) {
                    org.apache.poi.ss.usermodel.Sheet sheet = wsh.getSheet();
                    sheet.setColumnWidth(0, 16 * 256);
                    sheet.setColumnWidth(1, 18 * 256);
                    sheet.setColumnWidth(2, 14 * 256);
                    sheet.setColumnWidth(3, 40 * 256);
                    for (int i = 4; i < 4 + enterprises.size(); i++) {
                        sheet.setColumnWidth(i, 24 * 256);
                    }
                    // 仅冻结前4列（需求维度），横向滚动时保持左侧需求信息可见
                    sheet.createFreezePane(4, 0);
                }
            };

            WriteSheet sheet7 = EasyExcel.writerSheet(7, "需求分析")
                    .head(reqHead)
                    .registerWriteHandler(reqSheetHandler)
                    .build();

            List<List<Object>> reqData = new ArrayList<>();
            // 提示行
            List<Object> reqHint = new ArrayList<>();
            reqHint.add("填写说明");
            reqHint.add("");
            reqHint.add("");
            reqHint.add("每行一条需求；企业列填写“是/否”；最后一行“自定义需求”可自由填写");
            for (int i = 0; i < enterprises.size(); i++) {
                reqHint.add("填：是/否");
            }
            reqData.add(reqHint);
            // 示例行
            List<Object> reqExample = new ArrayList<>();
            reqExample.add("品牌规划");
            reqExample.add("品牌建设");
            reqExample.add("R-DEMO");
            reqExample.add("示例需求");
            for (int i = 0; i < enterprises.size(); i++) {
                reqExample.add(i % 3 == 0 ? "是" : "否"); // 交替填写示例
            }
            reqData.add(reqExample);
            // 需求数据行（空白待填写）
            for (RequirementConfigResponse.RequirementItemDTO req : allReqs) {
                List<Object> row = new ArrayList<>();
                row.add(req.getPhase());
                row.add(req.getCategory());
                row.add(req.getId());
                row.add(req.getName());
                for (int i = 0; i < enterprises.size(); i++) {
                    row.add(""); // 空白待填写
                }
                reqData.add(row);
            }
            // 自定义需求单独占一行，便于各企业横向填写
            List<Object> customReqRow = new ArrayList<>();
            customReqRow.add("");
            customReqRow.add("");
            customReqRow.add("");
            customReqRow.add("自定义需求（自由填写）");
            for (int i = 0; i < enterprises.size(); i++) {
                customReqRow.add("");
            }
            reqData.add(customReqRow);
            writer.write(reqData, sheet7);

            writer.finish();
        } catch (Exception e) {
            log.error("导出调研Excel失败", e);
            throw new BusinessException("导出失败: " + e.getMessage());
        }
    }

    /**
     * 从数据库加载所有选项分类的label列表
     */
    private Map<String, List<String>> loadAllOptionLabels() {
        Map<String, List<String>> result = new HashMap<>();
        String[] categories = {
            "district", "enterprise_type", "staff_size", "domestic_revenue", "cross_border_revenue",
            "source", "trade_mode", "trade_team_mode", "region", "certification", "automation_level",
            "cross_border_platform", "cross_border_logistics", "payment_settlement", "enjoyed_policy"
        };
        for (String category : categories) {
            LambdaQueryWrapper<SystemOption> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SystemOption::getCategory, category)
                    .eq(SystemOption::getIsEnabled, 1)
                    .orderByAsc(SystemOption::getSortOrder);
            List<SystemOption> options = systemOptionMapper.selectList(wrapper);
            result.put(category, options.stream().map(SystemOption::getLabel).collect(Collectors.toList()));
        }
        return result;
    }

    /**
     * 构建填写说明Sheet的表头
     */
    private List<List<String>> buildGuideHead() {
        List<List<String>> head = new ArrayList<>();
        head.add(Collections.singletonList("字段名称"));
        head.add(Collections.singletonList("所在Sheet"));
        head.add(Collections.singletonList("填写要求"));
        head.add(Collections.singletonList("可选值"));
        return head;
    }

    /**
     * 构建填写说明Sheet的数据
     */
    private List<List<String>> buildGuideData(Map<String, List<String>> optionLabels) {
        List<List<String>> data = new ArrayList<>();

        // 须知：合并为一行，用换行符分隔
        data.add(Arrays.asList("★ 填写须知", "",
                "1. 企业ID列请勿修改，系统依据此列匹配数据\n" +
                "2. 每个Sheet第2行为填写提示，第3行为示例，导入时自动跳过\n" +
                "3. 多选字段请用顿号（、）分隔多个值\n" +
                "4. 是/否字段只填\"是\"或\"否\"\n" +
                "5. 空单元格不会覆盖已有数据", ""));

        // ── 企业基本信息 ──
        data.add(Arrays.asList("── 企业基本信息 ──", "", "", ""));
        data.add(Arrays.asList("所属区域", "企业基本信息", "单选", String.join("、", optionLabels.getOrDefault("district", List.of()))));
        data.add(Arrays.asList("企业类型", "企业基本信息", "单选", String.join("、", optionLabels.getOrDefault("enterprise_type", List.of()))));
        data.add(Arrays.asList("人员规模", "企业基本信息", "单选", String.join("、", optionLabels.getOrDefault("staff_size", List.of()))));
        data.add(Arrays.asList("国内营收", "企业基本信息", "单选", String.join("、", optionLabels.getOrDefault("domestic_revenue", List.of()))));
        data.add(Arrays.asList("跨境营收", "企业基本信息", "数字(万元)或旧档位", "数值示例：350；档位：" + String.join("、", optionLabels.getOrDefault("cross_border_revenue", List.of()))));
        data.add(Arrays.asList("企业来源", "企业基本信息", "单选", String.join("、", optionLabels.getOrDefault("source", List.of()))));
        data.add(Arrays.asList("是否有自主品牌", "企业基本信息", "单选", "是、否"));

        // ── 联系人信息 ──
        data.add(Arrays.asList("── 联系人信息 ──", "", "", ""));
        data.add(Arrays.asList("是否主要联系人", "联系人信息", "单选", "是、否"));

        // ── 产品信息 ──
        data.add(Arrays.asList("── 产品信息 ──", "", "", ""));
        data.add(Arrays.asList("认证资质", "产品信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("certification", List.of()))));
        data.add(Arrays.asList("主要销售区域", "产品信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("region", List.of()))));
        data.add(Arrays.asList("主要销售国家", "产品信息", "多选，顿号分隔", "美国、加拿大、英国、德国、法国、日本、韩国、澳大利亚、新加坡、马来西亚、泰国、越南、印度、阿联酋"));
        data.add(Arrays.asList("设备自动化程度", "产品信息", "单选", String.join("、", optionLabels.getOrDefault("automation_level", List.of()))));
        data.add(Arrays.asList("物流合作方", "产品信息", "多选，顿号分隔", "DHL、UPS、FedEx、顺丰、中通、圆通、韵达"));

        // ── 外贸信息 ──
        data.add(Arrays.asList("── 外贸信息 ──", "", "", ""));
        data.add(Arrays.asList("主要销售区域", "外贸信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("region", List.of()))));
        data.add(Arrays.asList("主要销售国家", "外贸信息", "多选，顿号分隔", "美国、加拿大、英国、德国、法国、日本、韩国、澳大利亚等"));
        data.add(Arrays.asList("外贸模式", "外贸信息", "单选", String.join("、", optionLabels.getOrDefault("trade_mode", List.of()))));
        data.add(Arrays.asList("是否有进出口资质", "外贸信息", "单选", "是、否"));
        data.add(Arrays.asList("外贸团队模式", "外贸信息", "单选", String.join("、", optionLabels.getOrDefault("trade_team_mode", List.of()))));
        data.add(Arrays.asList("是否有国内电商经验", "外贸信息", "单选", "是、否"));
        data.add(Arrays.asList("增长/下降市场", "外贸信息", "格式：市场名 +/-变化率", "东南亚 +25%、欧洲 -8%"));
        data.add(Arrays.asList("增长/下降模式", "外贸信息", "格式：模式名 +/-变化率", "跨境电商B2C +35%、传统B2B -10%"));
        data.add(Arrays.asList("增长/下降品类", "外贸信息", "格式：品类名 +/-变化率", "园艺工具 +28%、传统手工具 -15%"));
        data.add(Arrays.asList("增长/下降原因", "外贸信息", "多个用顿号分隔", "东南亚市场需求旺盛、欧美市场竞争加剧"));

        // ── 跨境电商信息 ──
        data.add(Arrays.asList("── 跨境电商信息 ──", "", "", ""));
        data.add(Arrays.asList("是否开展跨境电商", "跨境电商信息", "单选", "是、否"));
        data.add(Arrays.asList("跨境平台", "跨境电商信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("cross_border_platform", List.of()))));
        data.add(Arrays.asList("跨境物流模式", "跨境电商信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("cross_border_logistics", List.of()))));
        data.add(Arrays.asList("支付结算方式", "跨境电商信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("payment_settlement", List.of()))));
        data.add(Arrays.asList("是否在用ERP", "跨境电商信息", "单选", "是、否"));
        data.add(Arrays.asList("跨境转型意愿", "跨境电商信息", "单选", "高、中、低"));
        data.add(Arrays.asList("愿意投入转型程度", "跨境电商信息", "单选", "高、中、低"));
        data.add(Arrays.asList("目标市场及占比", "跨境电商信息", "格式：市场名 占比%", "北美 40%、欧洲 30%、东南亚 20%、其他 10%"));

        // ── 合作与政策信息 ──
        data.add(Arrays.asList("── 合作与政策信息 ──", "", "", ""));
        data.add(Arrays.asList("合作评分(6项)", "合作与政策信息", "填1-5的数字", "1=很低、2=较低、3=一般、4=较高、5=很高"));
        data.add(Arrays.asList("标杆企业可能性", "合作与政策信息", "填0-100的数字", "百分比"));
        data.add(Arrays.asList("是否享受过政策支持", "合作与政策信息", "单选", "是、否"));
        data.add(Arrays.asList("已享受政策", "合作与政策信息", "多选，顿号分隔", String.join("、", optionLabels.getOrDefault("enjoyed_policy", List.of()))));
        data.add(Arrays.asList("行业竞争地位", "合作与政策信息", "单选", "头部企业、中型企业、初创企业"));
        data.add(Arrays.asList("当前面临风险", "合作与政策信息", "多选，顿号分隔", "原材料价格波动风险、跨境物流成本上涨、人才流失风险、汇率波动风险、市场竞争加剧、政策变化风险"));

        // ── 需求分析 ──
        data.add(Arrays.asList("── 需求分析 ──", "", "", ""));
        data.add(Arrays.asList("需求分析说明", "需求分析",
                "每行对应一条标准需求，左侧为阶段/分类/需求ID/需求名称；每列对应一个企业，填写\"是\"或\"否\"",
                "已冻结前4列与前6行；修改标准需求请在后台维护后重新下载模板"));
        data.add(Arrays.asList("自定义需求", "需求分析", "最后一行按企业列自由填写", "填写企业的个性化需求"));

        return data;
    }

    // ==================== 构建各Sheet数据 ====================

    private List<SurveyBasicInfoData> buildBasicInfoData(List<Enterprise> enterprises) {
        return enterprises.stream().map(e -> {
            SurveyBasicInfoData data = new SurveyBasicInfoData();
            data.setEnterpriseId(e.getId());
            data.setName(e.getName());
            data.setCreditCode(e.getCreditCode());
            data.setEstablishedDate(e.getEstablishedDate() != null ? e.getEstablishedDate().toString() : null);
            data.setRegisteredCapital(e.getRegisteredCapital());
            data.setDistrict(e.getDistrict());
            data.setAddress(e.getAddress());
            data.setEnterpriseType(e.getEnterpriseType());
            data.setWebsite(e.getWebsite());

            // 行业名称
            if (e.getIndustryId() != null) {
                IndustryCategory industry = industryCategoryMapper.selectById(e.getIndustryId());
                if (industry != null) data.setIndustryName(industry.getName());
            }

            // 人员规模
            if (e.getStaffSizeId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getStaffSizeId());
                if (opt != null) data.setStaffSize(opt.getLabel());
            }

            // 国内营收
            if (e.getDomesticRevenueId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getDomesticRevenueId());
                if (opt != null) data.setDomesticRevenue(opt.getLabel());
            }

            // 跨境营收
            if (e.getCrossBorderRevenueWan() != null) {
                data.setCrossBorderRevenue(e.getCrossBorderRevenueWan().stripTrailingZeros().toPlainString());
            } else if (e.getCrossBorderRevenueId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getCrossBorderRevenueId());
                if (opt != null) data.setCrossBorderRevenue(opt.getLabel());
            }

            // 企业来源
            if (e.getSourceId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getSourceId());
                if (opt != null) data.setSource(opt.getLabel());
            }

            // 品牌
            data.setHasOwnBrand(e.getHasOwnBrand() != null && e.getHasOwnBrand() == 1 ? "是" : "否");
            data.setBrandNames(e.getBrandNames());

            // 漏斗阶段
            SystemOption stageOpt = getOptionByValue("stage", e.getStage());
            if (stageOpt != null) data.setStageName(stageOpt.getLabel());

            // 资质认证
            data.setIsoCertifications(e.getIsoCertifications());
            data.setAeoCertification(e.getAeoCertification());
            data.setOtherCertifications(e.getOtherCertifications());

            return data;
        }).collect(Collectors.toList());
    }

    private List<SurveyContactData> buildContactData(List<Enterprise> enterprises) {
        List<SurveyContactData> result = new ArrayList<>();
        for (Enterprise e : enterprises) {
            List<EnterpriseContact> contacts = contactMapper.selectByEnterpriseId(e.getId());
            if (contacts != null && !contacts.isEmpty()) {
                for (EnterpriseContact c : contacts) {
                    SurveyContactData data = new SurveyContactData();
                    data.setEnterpriseId(e.getId());
                    data.setEnterpriseName(e.getName());
                    data.setName(c.getName());
                    data.setPhone(c.getPhone());
                    data.setPosition(c.getPosition());
                    data.setEmail(c.getEmail());
                    data.setWechat(c.getWechat());
                    data.setIsPrimary(c.getIsPrimary() == 1 ? "是" : "否");
                    data.setRemark(c.getRemark());
                    result.add(data);
                }
            } else {
                // 预留空行供填写
                SurveyContactData data = new SurveyContactData();
                data.setEnterpriseId(e.getId());
                data.setEnterpriseName(e.getName());
                result.add(data);
            }
        }
        return result;
    }

    private List<SurveyProductData> buildProductData(List<Enterprise> enterprises) {
        List<SurveyProductData> result = new ArrayList<>();
        for (Enterprise e : enterprises) {
            LambdaQueryWrapper<EnterpriseProduct> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(EnterpriseProduct::getEnterpriseId, e.getId());
            List<EnterpriseProduct> products = productMapper.selectList(wrapper);
            if (products != null && !products.isEmpty()) {
                for (EnterpriseProduct p : products) {
                    SurveyProductData data = new SurveyProductData();
                    data.setEnterpriseId(e.getId());
                    data.setEnterpriseName(e.getName());
                    data.setName(p.getName());
                    data.setAnnualSales(p.getAnnualSales());
                    data.setExportRatio(p.getExportRatio());
                    data.setProfitMargin(p.getProfitMargin());
                    data.setLocalProcurementRatio(p.getLocalProcurementRatio());
                    data.setAnnualCapacity(p.getAnnualCapacity());

                    // 品类名称
                    if (p.getCategoryId() != null) {
                        ProductCategory cat = productCategoryMapper.selectById(p.getCategoryId());
                        if (cat != null) data.setCategoryName(cat.getName());
                    }

                    // 认证
                    if (p.getCertificationIds() != null && !p.getCertificationIds().isEmpty()) {
                        List<String> names = new ArrayList<>();
                        for (Integer certId : p.getCertificationIds()) {
                            SystemOption opt = systemOptionMapper.selectById(certId);
                            if (opt != null) names.add(opt.getLabel());
                        }
                        data.setCertifications(String.join("、", names));
                    }

                    // 销售区域
                    if (p.getTargetRegionIds() != null && !p.getTargetRegionIds().isEmpty()) {
                        List<String> names = new ArrayList<>();
                        for (Integer regionId : p.getTargetRegionIds()) {
                            SystemOption opt = systemOptionMapper.selectById(regionId);
                            if (opt != null) names.add(opt.getLabel());
                        }
                        data.setTargetRegions(String.join("、", names));
                    }

                    // 自动化程度
                    if (p.getAutomationLevelId() != null) {
                        SystemOption opt = systemOptionMapper.selectById(p.getAutomationLevelId());
                        if (opt != null) data.setAutomationLevel(opt.getLabel());
                    }

                    result.add(data);
                }
            } else {
                SurveyProductData data = new SurveyProductData();
                data.setEnterpriseId(e.getId());
                data.setEnterpriseName(e.getName());
                result.add(data);
            }
        }
        return result;
    }

    private List<SurveyTradeData> buildTradeData(List<Enterprise> enterprises) {
        return enterprises.stream().map(e -> {
            SurveyTradeData data = new SurveyTradeData();
            data.setEnterpriseId(e.getId());
            data.setEnterpriseName(e.getName());

            // 销售区域
            if (e.getTargetRegionIds() != null && !e.getTargetRegionIds().isEmpty()) {
                List<String> names = new ArrayList<>();
                for (Integer regionId : e.getTargetRegionIds()) {
                    SystemOption opt = systemOptionMapper.selectById(regionId);
                    if (opt != null) names.add(opt.getLabel());
                }
                data.setTargetRegions(String.join("、", names));
            }

            // 主要销售国家
            if (e.getTargetCountryIds() != null && !e.getTargetCountryIds().isEmpty()) {
                data.setTargetCountries(String.join("、", e.getTargetCountryIds()));
            }

            // 外贸模式
            if (e.getTradeModeId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getTradeModeId());
                if (opt != null) data.setTradeMode(opt.getLabel());
            }

            data.setHasImportExportLicense(e.getHasImportExportLicense() != null && e.getHasImportExportLicense() == 1 ? "是" : "否");
            data.setCustomsDeclarationMode(e.getCustomsDeclarationMode());

            // 外贸团队模式
            if (e.getTradeTeamModeId() != null) {
                SystemOption opt = systemOptionMapper.selectById(e.getTradeTeamModeId());
                if (opt != null) data.setTradeTeamMode(opt.getLabel());
            }

            data.setTradeTeamSize(e.getTradeTeamSize() != null ? String.valueOf(e.getTradeTeamSize()) : "");
            data.setHasDomesticEcommerce(e.getHasDomesticEcommerce() != null && e.getHasDomesticEcommerce() == 1 ? "是" : "否");
            data.setLastYearRevenue(e.getLastYearRevenue() != null ? e.getLastYearRevenue().toString() : "");
            data.setYearBeforeLastRevenue(e.getYearBeforeLastRevenue() != null ? e.getYearBeforeLastRevenue().toString() : "");

            return data;
        }).collect(Collectors.toList());
    }

    private List<SurveyCrossBorderData> buildCrossBorderData(List<Enterprise> enterprises) {
        return enterprises.stream().map(e -> {
            SurveyCrossBorderData data = new SurveyCrossBorderData();
            data.setEnterpriseId(e.getId());
            data.setEnterpriseName(e.getName());
            data.setHasCrossBorder(e.getHasCrossBorder() != null && e.getHasCrossBorder() == 1 ? "是" : "否");

            // 跨境平台
            if (e.getCrossBorderPlatforms() instanceof List<?> platformList && !platformList.isEmpty()) {
                List<String> names = new ArrayList<>();
                for (Object item : platformList) {
                    if (item instanceof Integer) {
                        SystemOption opt = systemOptionMapper.selectById((Integer) item);
                        if (opt != null) names.add(opt.getLabel());
                    } else if (item instanceof String) {
                        names.add((String) item);
                    }
                }
                data.setCrossBorderPlatforms(String.join("、", names));
            }

            data.setCrossBorderRatio(e.getCrossBorderRatio());

            // 跨境物流
            if (StringUtils.hasText(e.getCrossBorderLogistics())) {
                data.setCrossBorderLogistics(resolveOptionLabels("cross_border_logistics", e.getCrossBorderLogistics()));
            }

            // 支付结算
            if (StringUtils.hasText(e.getPaymentSettlement())) {
                data.setPaymentSettlement(resolveOptionLabels("payment_settlement", e.getPaymentSettlement()));
            }

            data.setCrossBorderTeamSize(e.getCrossBorderTeamSize() != null ? String.valueOf(e.getCrossBorderTeamSize()) : "");
            data.setUsingErp(e.getUsingErp() != null && e.getUsingErp() == 1 ? "是" : "否");
            data.setHasOverseasDistributors(e.getHasOverseasDistributors() != null && e.getHasOverseasDistributors() == 1 ? "是" : "否");

            data.setTransformationWillingness(e.getTransformationWillingness());
            data.setInvestmentWillingness(e.getInvestmentWillingness());

            // 目标市场及占比
            if (e.getTargetMarkets() != null) {
                try {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> markets = (List<Map<String, Object>>) e.getTargetMarkets();
                    List<String> parts = new ArrayList<>();
                    for (Map<String, Object> m : markets) {
                        String market = String.valueOf(m.getOrDefault("market", ""));
                        Object pct = m.getOrDefault("percentage", "");
                        parts.add(market + " " + pct + "%");
                    }
                    data.setTargetMarkets(String.join("、", parts));
                } catch (Exception ignored) {
                    data.setTargetMarkets(e.getTargetMarkets().toString());
                }
            }

            return data;
        }).collect(Collectors.toList());
    }

    private List<SurveyCooperationData> buildCooperationData(List<Enterprise> enterprises) {
        return enterprises.stream().map(e -> {
            SurveyCooperationData data = new SurveyCooperationData();
            data.setEnterpriseId(e.getId());
            data.setEnterpriseName(e.getName());
            data.setServiceCooperationRating(ratingToString(e.getServiceCooperationRating()));
            data.setInvestmentCooperationRating(ratingToString(e.getInvestmentCooperationRating()));
            data.setIncubationCooperationRating(ratingToString(e.getIncubationCooperationRating()));
            data.setBrandCooperationRating(ratingToString(e.getBrandCooperationRating()));
            data.setTrainingCooperationRating(ratingToString(e.getTrainingCooperationRating()));
            data.setOverallCooperationRating(ratingToString(e.getOverallCooperationRating()));
            data.setBenchmarkPossibility(e.getBenchmarkPossibility() != null ? String.valueOf(e.getBenchmarkPossibility()) : "");
            data.setHasPolicySupport(e.getHasPolicySupport() != null && e.getHasPolicySupport() == 1 ? "是" : "否");

            // 已享受政策
            if (e.getEnjoyedPolicies() != null && !e.getEnjoyedPolicies().isEmpty()) {
                List<String> names = new ArrayList<>();
                for (String policyValue : e.getEnjoyedPolicies()) {
                    SystemOption opt = getOptionByValue("enjoyed_policy", policyValue);
                    if (opt != null) names.add(opt.getLabel());
                    else names.add(policyValue);
                }
                data.setEnjoyedPolicies(String.join("、", names));
            }

            data.setCompetitionPosition(e.getCompetitionPosition());
            data.setCompetitionDescription(e.getCompetitionDescription());
            data.setAdditionalNotes(e.getAdditionalNotes());

            if (e.getCurrentRiskTags() != null && !e.getCurrentRiskTags().isEmpty()) {
                data.setCurrentRisks(String.join("、", e.getCurrentRiskTags()));
            }
            data.setRiskDescription(e.getRiskDescription());

            return data;
        }).collect(Collectors.toList());
    }

    // ==================== 导入 ====================

    @Override
    @Transactional
    public ImportResultResponse importSurveyExcel(MultipartFile file) {
        List<ImportResultResponse.ErrorDetail> errors = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;
        // 企业名称 → 新生成ID 的映射，用于无ID新建企业时关联后续Sheet
        Map<String, Integer> nameToIdMap = new HashMap<>();

        try {
            // 读取Sheet1: 企业基本信息
            List<SurveyBasicInfoData> basicList = EasyExcel.read(file.getInputStream())
                    .head(SurveyBasicInfoData.class).sheet("企业基本信息").doReadSync();

            for (int i = 0; i < basicList.size(); i++) {
                int rowNum = i + 2;
                SurveyBasicInfoData data = basicList.get(i);
                try {
                    // 跳过提示行（企业ID为空且名称为空或为提示文本的行）
                    if (data.getEnterpriseId() == null && (!StringUtils.hasText(data.getName())
                            || data.getName().startsWith("【") || data.getName().startsWith("示例"))) {
                        continue;
                    }

                    Enterprise enterprise = resolveEnterpriseForImport(data);

                    if (enterprise != null && enterprise.getIsDeleted() != 1) {
                        // 已有企业，更新
                        updateBasicInfo(enterprise, data);
                        enterpriseMapper.updateById(enterprise);
                        nameToIdMap.put(enterprise.getName(), enterprise.getId());
                    } else {
                        // 企业不存在，按新企业创建；创建前校验数据库必填字段
                        validateBasicInfoForInsert(data);
                        enterprise = new Enterprise();
                        enterprise.setName(StringUtils.hasText(data.getName()) ? data.getName().trim() : "未命名企业");
                        enterprise.setStage("POTENTIAL"); // 与字典 enterprises.stage 约定一致
                        enterprise.setIsDeleted(0);
                        updateBasicInfo(enterprise, data);
                        enterpriseMapper.insert(enterprise);
                        // 记录名称→ID映射，供后续Sheet使用
                        nameToIdMap.put(enterprise.getName(), enterprise.getId());
                    }
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add(ImportResultResponse.ErrorDetail.builder()
                            .row(rowNum).message("[基本信息] " + buildFriendlyImportMessage(data, e.getMessage())).build());
                }
            }

            // 读取Sheet2: 联系人信息
            try {
                int errorCountBefore = errors.size();
                List<SurveyContactData> contactList = EasyExcel.read(file.getInputStream())
                        .head(SurveyContactData.class).sheet("联系人信息").doReadSync();
                importContacts(contactList, errors, nameToIdMap);
                failCount += errors.size() - errorCountBefore;
            } catch (Exception e) {
                log.warn("读取联系人Sheet失败: {}", e.getMessage());
                failCount++;
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[联系人] Sheet读取失败: " + e.getMessage()).build());
            }

            // 读取Sheet3: 产品信息
            try {
                int errorCountBefore = errors.size();
                List<SurveyProductData> productList = EasyExcel.read(file.getInputStream())
                        .head(SurveyProductData.class).sheet("产品信息").doReadSync();
                importProducts(productList, errors, nameToIdMap);
                failCount += errors.size() - errorCountBefore;
            } catch (Exception e) {
                log.warn("读取产品Sheet失败: {}", e.getMessage());
                failCount++;
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[产品] Sheet读取失败: " + e.getMessage()).build());
            }

            // 读取Sheet4: 外贸信息
            try {
                int errorCountBefore = errors.size();
                List<SurveyTradeData> tradeList = EasyExcel.read(file.getInputStream())
                        .head(SurveyTradeData.class).sheet("外贸信息").doReadSync();
                importTradeInfo(tradeList, errors, nameToIdMap);
                failCount += errors.size() - errorCountBefore;
            } catch (Exception e) {
                log.warn("读取外贸信息Sheet失败: {}", e.getMessage());
                failCount++;
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[外贸] Sheet读取失败: " + e.getMessage()).build());
            }

            // 读取Sheet5: 跨境电商信息
            try {
                int errorCountBefore = errors.size();
                List<SurveyCrossBorderData> cbList = EasyExcel.read(file.getInputStream())
                        .head(SurveyCrossBorderData.class).sheet("跨境电商信息").doReadSync();
                importCrossBorderInfo(cbList, errors, nameToIdMap);
                failCount += errors.size() - errorCountBefore;
            } catch (Exception e) {
                log.warn("读取跨境电商Sheet失败: {}", e.getMessage());
                failCount++;
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[跨境电商] Sheet读取失败: " + e.getMessage()).build());
            }

            // 读取Sheet6: 合作与政策信息
            try {
                int errorCountBefore = errors.size();
                List<SurveyCooperationData> coopList = EasyExcel.read(file.getInputStream())
                        .head(SurveyCooperationData.class).sheet("合作与政策信息").doReadSync();
                importCooperationInfo(coopList, errors, nameToIdMap);
                failCount += errors.size() - errorCountBefore;
            } catch (Exception e) {
                log.warn("读取合作与政策Sheet失败: {}", e.getMessage());
                failCount++;
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[合作与政策] Sheet读取失败: " + e.getMessage()).build());
            }

        } catch (Exception e) {
            log.error("导入调研Excel失败", e);
            throw BusinessException.badRequest("文件解析失败: " + e.getMessage());
        }

        log.info("导入调研Excel完成: success={}, failed={}", successCount, failCount);
        return ImportResultResponse.builder()
                .success(successCount).failed(failCount).errors(errors).build();
    }

    // ==================== 导入各Sheet数据 ====================

    private void updateBasicInfo(Enterprise enterprise, SurveyBasicInfoData data) {
        if (StringUtils.hasText(data.getName())) enterprise.setName(data.getName());
        if (StringUtils.hasText(data.getCreditCode())) enterprise.setCreditCode(data.getCreditCode());
        if (StringUtils.hasText(data.getEstablishedDate())) {
            try { enterprise.setEstablishedDate(java.time.LocalDate.parse(data.getEstablishedDate().trim())); } catch (Exception ignored) {}
        }
        if (StringUtils.hasText(data.getRegisteredCapital())) enterprise.setRegisteredCapital(data.getRegisteredCapital().trim());
        if (StringUtils.hasText(data.getDistrict())) enterprise.setDistrict(data.getDistrict());
        if (StringUtils.hasText(data.getAddress())) enterprise.setAddress(data.getAddress());
        if (StringUtils.hasText(data.getEnterpriseType())) enterprise.setEnterpriseType(data.getEnterpriseType());
        if (StringUtils.hasText(data.getWebsite())) enterprise.setWebsite(data.getWebsite());

        // 行业 - 按名称查找ID（支持别名映射和模糊匹配）
        if (StringUtils.hasText(data.getIndustryName())) {
            IndustryCategory industry = resolveIndustryByName(data.getIndustryName());
            if (industry != null) enterprise.setIndustryId(industry.getId());
        }

        // 人员规模 - 按label查找ID
        if (StringUtils.hasText(data.getStaffSize())) {
            SystemOption opt = getOptionByLabel("staff_size", data.getStaffSize().trim());
            if (opt != null) enterprise.setStaffSizeId(opt.getId());
        }

        // 国内营收
        if (StringUtils.hasText(data.getDomesticRevenue())) {
            SystemOption opt = getOptionByLabel("domestic_revenue", data.getDomesticRevenue().trim());
            if (opt != null) enterprise.setDomesticRevenueId(opt.getId());
        }

        // 跨境营收：优先按万元数值解析，否则按旧版档位文案匹配
        if (StringUtils.hasText(data.getCrossBorderRevenue())) {
            String raw = data.getCrossBorderRevenue().trim();
            BigDecimal wan = tryParseCrossBorderRevenueWan(raw);
            if (wan != null) {
                enterprise.setCrossBorderRevenueWan(wan);
                enterprise.setCrossBorderRevenueId(null);
            } else {
                SystemOption opt = getOptionByLabel("cross_border_revenue", raw);
                if (opt != null) {
                    enterprise.setCrossBorderRevenueId(opt.getId());
                    enterprise.setCrossBorderRevenueWan(null);
                }
            }
        }

        // 企业来源
        if (StringUtils.hasText(data.getSource())) {
            SystemOption opt = getOptionByLabel("source", data.getSource().trim());
            if (opt != null) enterprise.setSourceId(opt.getId());
        }

        // 品牌
        if (StringUtils.hasText(data.getHasOwnBrand())) {
            enterprise.setHasOwnBrand("是".equals(data.getHasOwnBrand().trim()) ? 1 : 0);
        }
        if (StringUtils.hasText(data.getBrandNames())) {
            enterprise.setBrandNames(data.getBrandNames().trim());
        }

        // 资质认证
        if (StringUtils.hasText(data.getIsoCertifications())) enterprise.setIsoCertifications(data.getIsoCertifications().trim());
        if (StringUtils.hasText(data.getAeoCertification())) enterprise.setAeoCertification(data.getAeoCertification().trim());
        if (StringUtils.hasText(data.getOtherCertifications())) enterprise.setOtherCertifications(data.getOtherCertifications().trim());
    }

    private Enterprise resolveEnterpriseForImport(SurveyBasicInfoData data) {
        if (data.getEnterpriseId() != null) {
            Enterprise byId = enterpriseMapper.selectById(data.getEnterpriseId());
            if (byId != null && byId.getIsDeleted() != 1) {
                return byId;
            }
        }

        if (StringUtils.hasText(data.getCreditCode())) {
            LambdaQueryWrapper<Enterprise> creditWrapper = new LambdaQueryWrapper<>();
            creditWrapper.eq(Enterprise::getCreditCode, data.getCreditCode().trim())
                    .eq(Enterprise::getIsDeleted, 0)
                    .last("LIMIT 1");
            Enterprise byCreditCode = enterpriseMapper.selectOne(creditWrapper);
            if (byCreditCode != null) {
                return byCreditCode;
            }
        }

        if (StringUtils.hasText(data.getName())) {
            LambdaQueryWrapper<Enterprise> nameWrapper = new LambdaQueryWrapper<>();
            nameWrapper.eq(Enterprise::getName, data.getName().trim())
                    .eq(Enterprise::getIsDeleted, 0)
                    .last("LIMIT 1");
            return enterpriseMapper.selectOne(nameWrapper);
        }

        return null;
    }

    private void validateBasicInfoForInsert(SurveyBasicInfoData data) {
        List<String> missingFields = new ArrayList<>();
        if (!StringUtils.hasText(data.getName())) {
            missingFields.add("企业名称");
        }
        if (!StringUtils.hasText(data.getDistrict())) {
            missingFields.add("所属区域");
        }
        if (!StringUtils.hasText(data.getEnterpriseType())) {
            missingFields.add("企业类型");
        }

        if (!missingFields.isEmpty()) {
            throw new BusinessException("无法新建企业，缺少必填字段: " + String.join("、", missingFields)
                    + "。建议补充企业ID，或补齐基础信息后重试。");
        }
    }

    private String buildFriendlyImportMessage(SurveyBasicInfoData data, String originalMessage) {
        String enterpriseHint = StringUtils.hasText(data.getName()) ? "企业「" + data.getName().trim() + "」" : "当前行";

        if (originalMessage != null && originalMessage.contains("cannot be null")) {
            List<String> missingFields = new ArrayList<>();
            if (!StringUtils.hasText(data.getDistrict())) {
                missingFields.add("所属区域");
            }
            if (!StringUtils.hasText(data.getEnterpriseType())) {
                missingFields.add("企业类型");
            }
            if (!StringUtils.hasText(data.getName())) {
                missingFields.add("企业名称");
            }
            if (!missingFields.isEmpty()) {
                return enterpriseHint + " 导入失败，缺少数据库必填字段: " + String.join("、", missingFields);
            }
        }

        return enterpriseHint + " 导入失败: " + originalMessage;
    }

    private void importContacts(List<SurveyContactData> contactList, List<ImportResultResponse.ErrorDetail> errors, Map<String, Integer> nameToIdMap) {
        // 按企业ID分组（先解析无ID的行）
        for (SurveyContactData c : contactList) {
            if (c.getEnterpriseId() == null && StringUtils.hasText(c.getEnterpriseName())) {
                Integer resolvedId = nameToIdMap.get(c.getEnterpriseName().trim());
                if (resolvedId != null) c.setEnterpriseId(resolvedId);
            }
        }
        Map<Integer, List<SurveyContactData>> grouped = contactList.stream()
                .filter(c -> c.getEnterpriseId() != null)
                .collect(Collectors.groupingBy(SurveyContactData::getEnterpriseId));

        for (Map.Entry<Integer, List<SurveyContactData>> entry : grouped.entrySet()) {
            Integer enterpriseId = entry.getKey();
            List<SurveyContactData> contacts = entry.getValue();

            try {
                Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
                if (enterprise == null || enterprise.getIsDeleted() == 1) continue;

                // 过滤掉空行（姓名为空的）
                List<SurveyContactData> validContacts = contacts.stream()
                        .filter(c -> StringUtils.hasText(c.getName()))
                        .collect(Collectors.toList());

                if (validContacts.isEmpty()) continue;

                // 删除旧联系人，插入新联系人
                LambdaQueryWrapper<EnterpriseContact> delWrapper = new LambdaQueryWrapper<>();
                delWrapper.eq(EnterpriseContact::getEnterpriseId, enterpriseId);
                contactMapper.delete(delWrapper);

                for (SurveyContactData c : validContacts) {
                    EnterpriseContact contact = new EnterpriseContact();
                    contact.setEnterpriseId(enterpriseId);
                    contact.setName(c.getName());
                    contact.setPhone(c.getPhone());
                    contact.setPosition(c.getPosition());
                    contact.setEmail(c.getEmail());
                    contact.setWechat(c.getWechat());
                    contact.setIsPrimary("是".equals(c.getIsPrimary()) ? 1 : 0);
                    contact.setRemark(c.getRemark());
                    contactMapper.insert(contact);
                }
            } catch (Exception e) {
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[联系人] 企业ID=" + enterpriseId + ": " + e.getMessage()).build());
            }
        }
    }

    private void importProducts(List<SurveyProductData> productList, List<ImportResultResponse.ErrorDetail> errors, Map<String, Integer> nameToIdMap) {
        for (SurveyProductData p : productList) {
            if (p.getEnterpriseId() == null && StringUtils.hasText(p.getEnterpriseName())) {
                Integer resolvedId = nameToIdMap.get(p.getEnterpriseName().trim());
                if (resolvedId != null) p.setEnterpriseId(resolvedId);
            }
        }
        Map<Integer, List<SurveyProductData>> grouped = productList.stream()
                .filter(p -> p.getEnterpriseId() != null)
                .collect(Collectors.groupingBy(SurveyProductData::getEnterpriseId));

        for (Map.Entry<Integer, List<SurveyProductData>> entry : grouped.entrySet()) {
            Integer enterpriseId = entry.getKey();
            List<SurveyProductData> products = entry.getValue();

            try {
                Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
                if (enterprise == null || enterprise.getIsDeleted() == 1) continue;

                List<SurveyProductData> validProducts = products.stream()
                        .filter(p -> StringUtils.hasText(p.getName()))
                        .collect(Collectors.toList());

                if (validProducts.isEmpty()) continue;

                // 删除旧产品，插入新产品
                LambdaQueryWrapper<EnterpriseProduct> delWrapper = new LambdaQueryWrapper<>();
                delWrapper.eq(EnterpriseProduct::getEnterpriseId, enterpriseId);
                productMapper.delete(delWrapper);

                for (SurveyProductData p : validProducts) {
                    EnterpriseProduct product = new EnterpriseProduct();
                    product.setEnterpriseId(enterpriseId);
                    product.setName(p.getName());
                    product.setAnnualSales(p.getAnnualSales());
                    if (StringUtils.hasText(p.getExportRatio())) product.setExportRatio(p.getExportRatio().trim());
                    if (StringUtils.hasText(p.getProfitMargin())) product.setProfitMargin(p.getProfitMargin().trim());
                    product.setLocalProcurementRatio(p.getLocalProcurementRatio());
                    product.setAnnualCapacity(p.getAnnualCapacity());

                    // 品类 - 按名称查找
                    if (StringUtils.hasText(p.getCategoryName())) {
                        LambdaQueryWrapper<ProductCategory> w = new LambdaQueryWrapper<>();
                        w.eq(ProductCategory::getName, p.getCategoryName().trim());
                        ProductCategory cat = productCategoryMapper.selectOne(w);
                        if (cat != null) product.setCategoryId(cat.getId());
                    }

                    // 认证 - 按label查找ID列表
                    if (StringUtils.hasText(p.getCertifications())) {
                        product.setCertificationIds(resolveOptionIds("certification", p.getCertifications()));
                    }

                    // 销售区域
                    if (StringUtils.hasText(p.getTargetRegions())) {
                        product.setTargetRegionIds(resolveOptionIds("region", p.getTargetRegions()));
                    }

                    // 自动化程度
                    if (StringUtils.hasText(p.getAutomationLevel())) {
                        SystemOption opt = getOptionByLabel("automation_level", p.getAutomationLevel().trim());
                        if (opt != null) product.setAutomationLevelId(opt.getId());
                    }

                    productMapper.insert(product);
                }
            } catch (Exception e) {
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[产品] 企业ID=" + enterpriseId + ": " + e.getMessage()).build());
            }
        }
    }

    private void importTradeInfo(List<SurveyTradeData> tradeList, List<ImportResultResponse.ErrorDetail> errors, Map<String, Integer> nameToIdMap) {
        for (SurveyTradeData data : tradeList) {
            if (data.getEnterpriseId() == null && StringUtils.hasText(data.getEnterpriseName())) {
                Integer resolvedId = nameToIdMap.get(data.getEnterpriseName().trim());
                if (resolvedId != null) data.setEnterpriseId(resolvedId);
            }
            if (data.getEnterpriseId() == null) continue;
            try {
                Enterprise enterprise = enterpriseMapper.selectById(data.getEnterpriseId());
                if (enterprise == null || enterprise.getIsDeleted() == 1) continue;

                // 销售区域
                if (StringUtils.hasText(data.getTargetRegions())) {
                    enterprise.setTargetRegionIds(resolveOptionIds("region", data.getTargetRegions()));
                }

                // 外贸模式
                if (StringUtils.hasText(data.getTradeMode())) {
                    SystemOption opt = getOptionByLabel("trade_mode", data.getTradeMode().trim());
                    if (opt != null) enterprise.setTradeModeId(opt.getId());
                }

                if (StringUtils.hasText(data.getHasImportExportLicense())) {
                    enterprise.setHasImportExportLicense("是".equals(data.getHasImportExportLicense().trim()) ? 1 : 0);
                }
                if (StringUtils.hasText(data.getCustomsDeclarationMode())) {
                    enterprise.setCustomsDeclarationMode(data.getCustomsDeclarationMode().trim());
                }

                // 外贸团队模式
                if (StringUtils.hasText(data.getTradeTeamMode())) {
                    SystemOption opt = getOptionByLabel("trade_team_mode", data.getTradeTeamMode().trim());
                    if (opt != null) enterprise.setTradeTeamModeId(opt.getId());
                }

                if (StringUtils.hasText(data.getTradeTeamSize())) {
                    try { enterprise.setTradeTeamSize(Integer.parseInt(data.getTradeTeamSize().trim())); }
                    catch (NumberFormatException ignored) {}
                }
                if (StringUtils.hasText(data.getHasDomesticEcommerce())) {
                    enterprise.setHasDomesticEcommerce("是".equals(data.getHasDomesticEcommerce().trim()) ? 1 : 0);
                }
                if (StringUtils.hasText(data.getLastYearRevenue())) {
                    try { enterprise.setLastYearRevenue(new BigDecimal(data.getLastYearRevenue().trim())); }
                    catch (NumberFormatException ignored) {}
                }
                if (StringUtils.hasText(data.getYearBeforeLastRevenue())) {
                    try { enterprise.setYearBeforeLastRevenue(new BigDecimal(data.getYearBeforeLastRevenue().trim())); }
                    catch (NumberFormatException ignored) {}
                }

                enterpriseMapper.updateById(enterprise);
            } catch (Exception e) {
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[外贸] 企业ID=" + data.getEnterpriseId() + ": " + e.getMessage()).build());
            }
        }
    }

    private void importCrossBorderInfo(List<SurveyCrossBorderData> cbList, List<ImportResultResponse.ErrorDetail> errors, Map<String, Integer> nameToIdMap) {
        for (SurveyCrossBorderData data : cbList) {
            if (data.getEnterpriseId() == null && StringUtils.hasText(data.getEnterpriseName())) {
                Integer resolvedId = nameToIdMap.get(data.getEnterpriseName().trim());
                if (resolvedId != null) data.setEnterpriseId(resolvedId);
            }
            if (data.getEnterpriseId() == null) continue;
            try {
                Enterprise enterprise = enterpriseMapper.selectById(data.getEnterpriseId());
                if (enterprise == null || enterprise.getIsDeleted() == 1) continue;

                if (StringUtils.hasText(data.getHasCrossBorder())) {
                    enterprise.setHasCrossBorder("是".equals(data.getHasCrossBorder().trim()) ? 1 : 0);
                }

                // 跨境平台
                if (StringUtils.hasText(data.getCrossBorderPlatforms())) {
                    enterprise.setCrossBorderPlatforms(resolveOptionIds("cross_border_platform", data.getCrossBorderPlatforms()));
                }

                if (StringUtils.hasText(data.getCrossBorderRatio())) {
                    enterprise.setCrossBorderRatio(data.getCrossBorderRatio().trim());
                }

                // 跨境物流 - 存储为逗号分隔的ID字符串
                if (StringUtils.hasText(data.getCrossBorderLogistics())) {
                    List<Integer> ids = resolveOptionIds("cross_border_logistics", data.getCrossBorderLogistics());
                    if (!ids.isEmpty()) {
                        enterprise.setCrossBorderLogistics(ids.stream().map(String::valueOf).collect(Collectors.joining(",")));
                    }
                }

                // 支付结算
                if (StringUtils.hasText(data.getPaymentSettlement())) {
                    List<Integer> ids = resolveOptionIds("payment_settlement", data.getPaymentSettlement());
                    if (!ids.isEmpty()) {
                        enterprise.setPaymentSettlement(ids.stream().map(String::valueOf).collect(Collectors.joining(",")));
                    }
                }

                if (StringUtils.hasText(data.getCrossBorderTeamSize())) {
                    try { enterprise.setCrossBorderTeamSize(Integer.parseInt(data.getCrossBorderTeamSize().trim())); }
                    catch (NumberFormatException ignored) {}
                }
                if (StringUtils.hasText(data.getUsingErp())) {
                    enterprise.setUsingErp("是".equals(data.getUsingErp().trim()) ? 1 : 0);
                }
                if (StringUtils.hasText(data.getHasOverseasDistributors())) {
                    enterprise.setHasOverseasDistributors("是".equals(data.getHasOverseasDistributors().trim()) ? 1 : 0);
                }
                if (StringUtils.hasText(data.getTransformationWillingness())) {
                    enterprise.setTransformationWillingness(data.getTransformationWillingness().trim());
                }
                if (StringUtils.hasText(data.getInvestmentWillingness())) {
                    enterprise.setInvestmentWillingness(data.getInvestmentWillingness().trim());
                }

                enterpriseMapper.updateById(enterprise);
            } catch (Exception e) {
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[跨境] 企业ID=" + data.getEnterpriseId() + ": " + e.getMessage()).build());
            }
        }
    }

    private void importCooperationInfo(List<SurveyCooperationData> coopList, List<ImportResultResponse.ErrorDetail> errors, Map<String, Integer> nameToIdMap) {
        for (SurveyCooperationData data : coopList) {
            if (data.getEnterpriseId() == null && StringUtils.hasText(data.getEnterpriseName())) {
                Integer resolvedId = nameToIdMap.get(data.getEnterpriseName().trim());
                if (resolvedId != null) data.setEnterpriseId(resolvedId);
            }
            if (data.getEnterpriseId() == null) continue;
            try {
                Enterprise enterprise = enterpriseMapper.selectById(data.getEnterpriseId());
                if (enterprise == null || enterprise.getIsDeleted() == 1) continue;

                enterprise.setServiceCooperationRating(parseRating(data.getServiceCooperationRating()));
                enterprise.setInvestmentCooperationRating(parseRating(data.getInvestmentCooperationRating()));
                enterprise.setIncubationCooperationRating(parseRating(data.getIncubationCooperationRating()));
                enterprise.setBrandCooperationRating(parseRating(data.getBrandCooperationRating()));
                enterprise.setTrainingCooperationRating(parseRating(data.getTrainingCooperationRating()));
                enterprise.setOverallCooperationRating(parseRating(data.getOverallCooperationRating()));

                if (StringUtils.hasText(data.getBenchmarkPossibility())) {
                    try { enterprise.setBenchmarkPossibility(Integer.parseInt(data.getBenchmarkPossibility().trim())); }
                    catch (NumberFormatException ignored) {}
                }

                if (StringUtils.hasText(data.getHasPolicySupport())) {
                    enterprise.setHasPolicySupport("是".equals(data.getHasPolicySupport().trim()) ? 1 : 0);
                }

                // 已享受政策 - 按label反查value
                if (StringUtils.hasText(data.getEnjoyedPolicies())) {
                    String[] labels = data.getEnjoyedPolicies().split("[、,，]");
                    List<String> values = new ArrayList<>();
                    for (String label : labels) {
                        SystemOption opt = getOptionByLabel("enjoyed_policy", label.trim());
                        if (opt != null) values.add(opt.getValue());
                    }
                    if (!values.isEmpty()) enterprise.setEnjoyedPolicies(values);
                }

                if (StringUtils.hasText(data.getCompetitionPosition())) {
                    enterprise.setCompetitionPosition(data.getCompetitionPosition().trim());
                }
                if (StringUtils.hasText(data.getCompetitionDescription())) {
                    enterprise.setCompetitionDescription(data.getCompetitionDescription().trim());
                }
                if (StringUtils.hasText(data.getCurrentRisks())) {
                    String[] parts = data.getCurrentRisks().split("[、,，]");
                    List<String> tags = new ArrayList<>();
                    for (String p : parts) {
                        String t = p.trim();
                        if (!t.isEmpty()) {
                            tags.add(t);
                        }
                    }
                    enterprise.setCurrentRiskTags(tags);
                }
                if (StringUtils.hasText(data.getRiskDescription())) {
                    enterprise.setRiskDescription(data.getRiskDescription().trim());
                }
                // suggestions、surveyDate、surveyStaff 暂无对应库字段
                if (StringUtils.hasText(data.getAdditionalNotes())) {
                    enterprise.setAdditionalNotes(data.getAdditionalNotes().trim());
                }

                enterpriseMapper.updateById(enterprise);
            } catch (Exception e) {
                errors.add(ImportResultResponse.ErrorDetail.builder()
                        .row(0).message("[合作] 企业ID=" + data.getEnterpriseId() + ": " + e.getMessage()).build());
            }
        }
    }

    // ==================== 行业别名映射 ====================

    private static final Map<String, String> INDUSTRY_ALIAS_MAP = new HashMap<>();
    static {
        // 汽车零部件
        for (String alias : new String[]{"汽配", "汽车配件", "汽车部件", "汽车配套工具", "汽车制造"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "汽车零部件");
        }
        // 纺织服装
        for (String alias : new String[]{"纺织", "纺织品", "纺织业", "纺织服装类", "纺织科技", "纺机",
                "针纺织品", "纺织服装", "服装", "服装制造", "服装贸易进出口", "服装贸易", "织品", "纺织服装类"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "纺织服装");
        }
        // 医疗器械
        for (String alias : new String[]{"医疗", "医疗行业", "制药装备"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "医疗器械");
        }
        // 机械设备
        for (String alias : new String[]{"机械", "机械设备制造", "干燥设备", "干燥业", "通用设备",
                "35专用设备制造业", "通信设备"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "机械设备");
        }
        // 电子产品
        for (String alias : new String[]{"电子", "电子电工", "电子机械", "电机行业",
                "3c", "3c电子", "电子产品"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "电子产品");
        }
        // 五金建材
        for (String alias : new String[]{"五金", "五金工具", "五金工具制造", "建材", "建筑", "建筑工程",
                "建筑材料", "装饰材料", "钣金制造", "高压配电", "齿轮"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "五金建材");
        }
        // 照明灯具
        for (String alias : new String[]{"灯具", "灯具照明", "照明"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "照明灯具");
        }
        // 家居用品
        for (String alias : new String[]{"家居", "家具", "家居园艺", "智能家居", "厨具",
                "日用百货", "办公用品", "家居用品"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "家居用品");
        }
        // 化工材料
        for (String alias : new String[]{"化工", "塑料包装", "新材料"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "化工材料");
        }
        // 新能源
        for (String alias : new String[]{"光伏", "光伏行业"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "新能源");
        }
        // 电动工具
        INDUSTRY_ALIAS_MAP.put("扳机", "电动工具");
        // 箱包皮具
        INDUSTRY_ALIAS_MAP.put("箱包", "箱包皮具");
        // 综合贸易
        for (String alias : new String[]{"贸易", "工贸一体", "卖家", "批发外贸", "批发商"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "综合贸易");
        }
        // 批发零售
        for (String alias : new String[]{"批发", "批发业", "批发和零售业", "批发零售业", "多品类"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "批发零售");
        }
        // 电商运营
        for (String alias : new String[]{"电商", "跨境卖家", "跨境电商", "互联网销售"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "电商运营");
        }
        // 进出口代理
        for (String alias : new String[]{"进出口", "艺术品进出口", "技术进出口"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "进出口代理");
        }
        // 信息技术
        for (String alias : new String[]{"软件", "信息工程", "信息传输软件业", "技术服务",
                "人工智能", "智能机器人", "高新技术业", "互联网信息"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "信息技术");
        }
        // 物流仓储
        INDUSTRY_ALIAS_MAP.put("海路运输", "物流仓储");
        // 金融服务
        INDUSTRY_ALIAS_MAP.put("金融", "金融服务");
        // 营销推广
        for (String alias : new String[]{"广告", "展示器材"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "营销推广");
        }
        // 其他制造
        for (String alias : new String[]{"制造", "制造业", "工业制造", "工业品", "生产制造",
                "生产加工", "印刷", "服务业", "文化", "轻工业", "成人用品"}) {
            INDUSTRY_ALIAS_MAP.put(alias, "其他制造");
        }
        // 补充：复合名称和剩余映射
        INDUSTRY_ALIAS_MAP.put("刀具", "五金建材");
        INDUSTRY_ALIAS_MAP.put("机电行业", "机械设备");
        INDUSTRY_ALIAS_MAP.put("汽车零部件，机械零部件，轴承", "汽车零部件");
        INDUSTRY_ALIAS_MAP.put("新能源航空动力系统 / 电机制造", "新能源");
        INDUSTRY_ALIAS_MAP.put("环保设备 / 净化科技", "机械设备");
        INDUSTRY_ALIAS_MAP.put("计算机信息技术服务 / 系统集成", "信息技术");
        INDUSTRY_ALIAS_MAP.put("建筑材料 / 化工产品 / 合成材料", "五金建材");
        INDUSTRY_ALIAS_MAP.put("互联网 / 电子商务", "电商运营");
        INDUSTRY_ALIAS_MAP.put("先进制造 / 电机及控制器制造", "机械设备");
        INDUSTRY_ALIAS_MAP.put("建筑材料", "五金建材");
        INDUSTRY_ALIAS_MAP.put("服装贸易", "纺织服装");
    }

    /**
     * 解析行业名称：先精确匹配数据库，再走别名映射
     */
    private IndustryCategory resolveIndustryByName(String rawName) {
        if (!StringUtils.hasText(rawName)) return null;
        String name = rawName.trim();

        // 1) 精确匹配
        LambdaQueryWrapper<IndustryCategory> w = new LambdaQueryWrapper<>();
        w.eq(IndustryCategory::getName, name);
        IndustryCategory result = industryCategoryMapper.selectOne(w);
        if (result != null) return result;

        // 2) 别名映射
        String mapped = INDUSTRY_ALIAS_MAP.get(name);
        if (mapped != null) {
            LambdaQueryWrapper<IndustryCategory> w2 = new LambdaQueryWrapper<>();
            w2.eq(IndustryCategory::getName, mapped);
            result = industryCategoryMapper.selectOne(w2);
            if (result != null) return result;
        }

        // 3) 处理含斜杠/空格的复合名称：取第一个关键词匹配
        String first = name.split("[/，、\\s]")[0].trim();
        if (!first.equals(name) && first.length() >= 2) {
            mapped = INDUSTRY_ALIAS_MAP.get(first);
            if (mapped != null) {
                LambdaQueryWrapper<IndustryCategory> w3 = new LambdaQueryWrapper<>();
                w3.eq(IndustryCategory::getName, mapped);
                result = industryCategoryMapper.selectOne(w3);
                if (result != null) return result;
            }
        }

        // 4) LIKE 模糊匹配（最后手段）
        LambdaQueryWrapper<IndustryCategory> wLike = new LambdaQueryWrapper<>();
        wLike.like(IndustryCategory::getName, name).last("LIMIT 1");
        result = industryCategoryMapper.selectOne(wLike);
        if (result != null) return result;

        log.warn("行业匹配失败: '{}'，无精确匹配、别名映射或模糊匹配", name);
        return null;
    }

    // ==================== 工具方法 ====================

    /**
     * 跨境营收单元格：纯数字或带「万」「元」的数值，单位万元；无法解析则返回 null（可走档位文案）
     */
    private BigDecimal tryParseCrossBorderRevenueWan(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String s = raw.trim()
                .replace("万元", "")
                .replace("万", "")
                .replace("元", "")
                .replace(",", "")
                .replace("，", "")
                .trim();
        if (!StringUtils.hasText(s)) {
            return null;
        }
        try {
            BigDecimal v = new BigDecimal(s);
            return v.signum() >= 0 ? v : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private SystemOption getOptionByValue(String category, String value) {
        if (value == null) return null;
        LambdaQueryWrapper<SystemOption> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SystemOption::getCategory, category)
                .eq(SystemOption::getValue, value);
        return systemOptionMapper.selectOne(wrapper);
    }

    private SystemOption getOptionByLabel(String category, String label) {
        if (label == null) return null;
        LambdaQueryWrapper<SystemOption> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SystemOption::getCategory, category)
                .eq(SystemOption::getLabel, label);
        return systemOptionMapper.selectOne(wrapper);
    }

    /**
     * 将逗号/顿号分隔的label字符串解析为ID列表
     */
    private List<Integer> resolveOptionIds(String category, String labelsStr) {
        String[] labels = labelsStr.split("[、,，]");
        List<Integer> ids = new ArrayList<>();
        for (String label : labels) {
            SystemOption opt = getOptionByLabel(category, label.trim());
            if (opt != null) ids.add(opt.getId());
        }
        return ids;
    }

    /**
     * 将逗号分隔的ID字符串解析为label字符串
     */
    private String resolveOptionLabels(String category, String idsStr) {
        String[] idStrs = idsStr.split(",");
        List<String> labels = new ArrayList<>();
        for (String idStr : idStrs) {
            try {
                Integer id = Integer.parseInt(idStr.trim());
                SystemOption opt = systemOptionMapper.selectById(id);
                if (opt != null) labels.add(opt.getLabel());
            } catch (NumberFormatException ignored) {
                // 可能已经是label了
                labels.add(idStr.trim());
            }
        }
        return String.join("、", labels);
    }

    private String ratingToString(Integer rating) {
        return rating != null ? String.valueOf(rating) : "";
    }

    private Integer parseRating(String ratingStr) {
        if (!StringUtils.hasText(ratingStr)) return null;
        try {
            int val = Integer.parseInt(ratingStr.trim());
            return val >= 1 && val <= 5 ? val : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
