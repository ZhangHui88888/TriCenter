package com.tricenter.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.AiReportGenerateRequest;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.mapper.EnterpriseProductMapper;
import com.tricenter.security.CityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class AiMarketReportService {

    private static final int HOURLY_LIMIT = 10;
    private static final int MAX_PROVIDER_RESPONSE_CHARS = 1_000_000;
    private static final List<String> BASIC_REQUIRED_KEYS = List.of(
            "marketDistribution", "tradePolicies", "consumptionLevel", "ecommPenetration",
            "culturalPreferences", "tradeAgreements", "certRequirements", "labelRegulations",
            "envCompliance", "importRestrictions", "buyerProfile", "buyerPainPoints",
            "unmetDemands", "industryMarketSize", "industryGrowthRate", "industryStage",
            "industryTrends", "competitors", "swot", "productQuality",
            "productDifferentiation", "productValueForMoney", "productCertStatus",
            "productPackaging", "pricingModel", "priceComparison", "tariffImpact",
            "localizationNeeds", "productAdjustment", "afterSalesCapability",
            "socialMediaStatus", "exhibitionStatus", "distributorNetwork", "seoAdsStatus",
            "crmUsage", "repurchaseRate", "customerFeedback", "riskAssessment",
            "comprehensiveScoring", "coreIssues", "actionSuggestions", "recommendedServices",
            "servicePriority", "expectedEffect", "followUpPlan");
    private static final List<String> DEEP_REQUIRED_KEYS = List.of(
            "marketOverview", "buyerProfile", "industryTrends",
            "competition", "risks", "recommendations");
    private static final String SYSTEM_PROMPT = """
            你是严谨的跨境电商市场分析师。只基于提供的企业非个人信息生成分析，
            不得编造企业联系人、客户或竞争对手事实。返回纯 JSON 对象，不要返回 Markdown。
            无可靠依据的信息必须明确标注“待调研”。
            """;
    private static final String BASIC_SCHEMA_PROMPT = """
            生成基础版报告。JSON 必须包含请求列出的每一个字段，不能缺省。
            marketDistribution、buyerPainPoints、unmetDemands、competitors、riskAssessment、
            comprehensiveScoring、coreIssues、actionSuggestions 使用数组；buyerProfile 与 swot 使用对象；
            其余字段使用中文字符串。竞争对手只能描述类型，不得编造具体公司。
            """;
    private static final String DEEP_SCHEMA_PROMPT = """
            生成深度版摘要。marketOverview、buyerProfile、industryTrends、competition、risks、
            recommendations 六个字段均使用完整中文分析字符串，每个字段都必须存在且非空。
            """;

    private final CityAccessService cityAccessService;
    private final CityContext cityContext;
    private final MarketReportService marketReportService;
    private final EnterpriseProductMapper enterpriseProductMapper;
    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;
    private final Set<Integer> runningUsers = ConcurrentHashMap.newKeySet();
    private final ConcurrentHashMap<String, AtomicInteger> fallbackRate = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${tricenter.ai.base-url:https://api.deepseek.com}")
    private String providerBaseUrl;

    public Map<String, Object> generate(Integer userId, AiReportGenerateRequest request) {
        if (!runningUsers.add(userId)) {
            throw new BusinessException(409, "同一用户只能同时生成一份报告");
        }
        try {
            consumeRateLimit(userId);
            Enterprise enterprise = cityAccessService.requireEnterprise(
                    request.getEnterpriseId(), cityContext.requireCityId());
            List<EnterpriseProduct> products = enterpriseProductMapper.selectList(
                    new LambdaQueryWrapper<EnterpriseProduct>()
                            .eq(EnterpriseProduct::getEnterpriseId, enterprise.getId())
                            .orderByAsc(EnterpriseProduct::getId)
                            .last("LIMIT 50"));
            Map<String, Object> generated = callProvider(
                    request.getProviderApiKey(), enterprise, products, request.getVersion());
            marketReportService.upsert(enterprise.getId(), request.getVersion(), generated);
            return generated;
        } finally {
            runningUsers.remove(userId);
        }
    }

    private Map<String, Object> callProvider(String apiKey, Enterprise enterprise,
                                             List<EnterpriseProduct> products, String version) {
        try {
            List<String> requiredKeys = requiredKeys(version);
            Map<String, Object> body = Map.of(
                    "model", "deepseek-chat",
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", buildPrompt(
                                    enterprise, products, version, requiredKeys))),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", 0.3,
                    "stream", false);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(providerBaseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(120))
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException(502, "第三方 AI 服务请求失败");
            }
            if (response.body().length() > MAX_PROVIDER_RESPONSE_CHARS) {
                throw new BusinessException(502, "第三方 AI 返回内容过大");
            }
            Map<String, Object> envelope = objectMapper.readValue(
                    response.body(), new TypeReference<>() {});
            String content = extractContent(envelope);
            Map<String, Object> generated = objectMapper.readValue(
                    content, new TypeReference<>() {});
            return validateAndNormalize(generated, requiredKeys);
        } catch (BusinessException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(502, "AI 生成已中断");
        } catch (Exception e) {
            throw new BusinessException(502, "第三方 AI 返回格式无效");
        }
    }

    private String buildPrompt(Enterprise enterprise, List<EnterpriseProduct> products,
                               String version, List<String> requiredKeys) {
        String schema = "basic".equals(version) ? BASIC_SCHEMA_PROMPT : DEEP_SCHEMA_PROMPT;
        return buildRedactedContext(enterprise, products, version)
                + System.lineSeparator() + System.lineSeparator()
                + schema + System.lineSeparator()
                + "必需字段：" + String.join(",", requiredKeys);
    }

    private List<String> requiredKeys(String version) {
        return "basic".equals(version) ? BASIC_REQUIRED_KEYS : DEEP_REQUIRED_KEYS;
    }

    Map<String, Object> validateAndNormalize(
            Map<String, Object> generated, List<String> requiredKeys) throws Exception {
        Map<String, Object> normalized = new LinkedHashMap<>();
        for (String key : requiredKeys) {
            Object value = generated.get(key);
            if (value == null || value instanceof String text && text.isBlank()
                    || value instanceof Map<?, ?> map && map.isEmpty()
                    || value instanceof List<?> list && list.isEmpty()) {
                throw new BusinessException(502, "第三方 AI 返回缺少必需字段");
            }
            normalized.put(key, value instanceof String
                    ? value
                    : objectMapper.writeValueAsString(value));
        }
        return normalized;
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> envelope) {
        Object choicesValue = envelope.get("choices");
        if (!(choicesValue instanceof List<?> choices) || choices.isEmpty()
                || !(choices.get(0) instanceof Map<?, ?> first)
                || !(first.get("message") instanceof Map<?, ?> message)
                || !(message.get("content") instanceof String content)
                || content.isBlank()) {
            throw new BusinessException(502, "第三方 AI 返回格式无效");
        }
        return content;
    }

    private String buildRedactedContext(Enterprise enterprise,
                                        List<EnterpriseProduct> products, String version) {
        String format = String.join(System.lineSeparator(),
                "报告版本：%s", "企业名称：%s", "企业类型：%s", "所在地区：%s%s%s",
                "行业分类ID：%s", "品牌：%s", "国内营收（万元）：%s", "上年外贸营收（万元）：%s",
                "是否开展跨境电商：%s", "目标区域ID：%s", "目标国家代码：%s", "当前阶段：%s");
        String enterpriseContext = format.formatted(
                version, safe(enterprise.getName()), safe(enterprise.getEnterpriseType()),
                safe(enterprise.getProvince()), safe(enterprise.getCity()), safe(enterprise.getDistrict()),
                safe(enterprise.getIndustryId()), safe(enterprise.getBrandNames()),
                safe(enterprise.getDomesticRevenueWan()), safe(enterprise.getLastYearRevenue()),
                safe(enterprise.getHasCrossBorder()), safe(enterprise.getTargetRegionIds()),
                safe(enterprise.getTargetCountryIds()), safe(enterprise.getStage()));
        StringBuilder context = new StringBuilder(enterpriseContext);
        if (!products.isEmpty()) {
            context.append(System.lineSeparator()).append("产品信息：");
            for (EnterpriseProduct product : products) {
                context.append(System.lineSeparator()).append("- ")
                        .append(safe(product.getName()))
                        .append("；品类ID=").append(safe(product.getCategoryId()))
                        .append("；认证ID=").append(safe(product.getCertificationIds()))
                        .append("；目标国家=").append(safe(product.getTargetCountryIds()))
                        .append("；年销售额=").append(safe(product.getAnnualSales()))
                        .append("；出口占比=").append(safe(product.getExportRatio()))
                        .append("；利润率=").append(safe(product.getProfitMargin()))
                        .append("；年产能=").append(safe(product.getAnnualCapacity()));
            }
        }
        return context.toString();
    }

    private String safe(Object value) {
        return value == null ? "未提供" : String.valueOf(value);
    }

    private void consumeRateLimit(Integer userId) {
        String bucket = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHH"));
        String key = "ai:report-rate:" + userId + ':' + bucket;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) redisTemplate.expire(key, Duration.ofHours(2));
            if (count != null && count > HOURLY_LIMIT) {
                throw new BusinessException(429, "AI 报告生成已达到每小时 10 次上限");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception ignored) {
            int count = fallbackRate.computeIfAbsent(key, ignoredKey -> new AtomicInteger()).incrementAndGet();
            if (count > HOURLY_LIMIT) {
                throw new BusinessException(429, "AI 报告生成已达到每小时 10 次上限");
            }
        }
    }
}
