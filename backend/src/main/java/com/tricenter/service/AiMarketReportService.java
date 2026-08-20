package com.tricenter.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.AiReportGenerateRequest;
import com.tricenter.entity.Enterprise;
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
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class AiMarketReportService {

    private static final int HOURLY_LIMIT = 10;
    private static final String SYSTEM_PROMPT = """
            你是严谨的跨境电商市场分析师。只基于提供的企业非个人信息生成分析，
            不得编造企业联系人、客户或竞争对手事实。返回纯 JSON 对象，不要返回 Markdown。
            JSON 应包含 marketOverview、buyerProfile、industryTrends、competition、risks、recommendations。
            无可靠依据的信息必须明确标注“待调研”。
            """;

    private final CityAccessService cityAccessService;
    private final CityContext cityContext;
    private final MarketReportService marketReportService;
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
            Map<String, Object> generated = callProvider(
                    request.getProviderApiKey(), enterprise, request.getVersion());
            marketReportService.upsert(enterprise.getId(), request.getVersion(), generated);
            return generated;
        } finally {
            runningUsers.remove(userId);
        }
    }

    private Map<String, Object> callProvider(String apiKey, Enterprise enterprise, String version) {
        try {
            Map<String, Object> body = Map.of(
                    "model", "deepseek-chat",
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", buildRedactedContext(enterprise, version))),
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
            Map<String, Object> envelope = objectMapper.readValue(
                    response.body(), new TypeReference<>() {});
            String content = extractContent(envelope);
            Map<String, Object> generated = objectMapper.readValue(
                    content, new TypeReference<>() {});
            if (generated.isEmpty()) {
                throw new BusinessException(502, "第三方 AI 返回了空报告");
            }
            return generated;
        } catch (BusinessException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(502, "AI 生成已中断");
        } catch (Exception e) {
            throw new BusinessException(502, "第三方 AI 返回格式无效");
        }
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

    private String buildRedactedContext(Enterprise enterprise, String version) {
        String format = String.join(System.lineSeparator(),
                "报告版本：%s", "企业名称：%s", "企业类型：%s", "所在地区：%s%s%s",
                "行业分类ID：%s", "品牌：%s", "国内营收（万元）：%s", "上年外贸营收（万元）：%s",
                "是否开展跨境电商：%s", "目标区域ID：%s", "目标国家代码：%s", "当前阶段：%s");
        return format.formatted(
                version, safe(enterprise.getName()), safe(enterprise.getEnterpriseType()),
                safe(enterprise.getProvince()), safe(enterprise.getCity()), safe(enterprise.getDistrict()),
                safe(enterprise.getIndustryId()), safe(enterprise.getBrandNames()),
                safe(enterprise.getDomesticRevenueWan()), safe(enterprise.getLastYearRevenue()),
                safe(enterprise.getHasCrossBorder()), safe(enterprise.getTargetRegionIds()),
                safe(enterprise.getTargetCountryIds()), safe(enterprise.getStage()));
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
