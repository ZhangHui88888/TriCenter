package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshSessionService {

    private static final Duration SESSION_TTL = Duration.ofDays(7);
    private static final String REFRESH_PREFIX = "auth:refresh:";
    private static final String USER_PREFIX = "auth:user-sessions:";
    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public IssuedRefreshSession issue(
            Integer userId, Integer currentCityId, boolean citySelectionPending) {
        try {
            byte[] random = new byte[32];
            secureRandom.nextBytes(random);
            String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
            String tokenHash = sha256(rawToken);
            String sessionValue = userId + ":" +
                    (currentCityId == null ? "" : currentCityId) + ":" + citySelectionPending;
            redisTemplate.opsForValue().set(REFRESH_PREFIX + tokenHash, sessionValue, SESSION_TTL);
            redisTemplate.opsForSet().add(USER_PREFIX + userId, tokenHash);
            redisTemplate.expire(USER_PREFIX + userId, SESSION_TTL);
            return new IssuedRefreshSession(rawToken,
                    new RefreshContext(userId, currentCityId, citySelectionPending));
        } catch (Exception e) {
            log.error("无法创建 refresh session", e);
            throw new BusinessException(503, "认证会话服务暂不可用，请稍后重试");
        }
    }

    public IssuedRefreshSession rotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw BusinessException.unauthorized("refresh session 不存在");
        }
        try {
            String tokenHash = sha256(rawToken);
            String value = redisTemplate.opsForValue().getAndDelete(REFRESH_PREFIX + tokenHash);
            if (value == null) {
                throw BusinessException.unauthorized("refresh session 已失效");
            }
            RefreshContext context = parse(value);
            redisTemplate.opsForSet().remove(USER_PREFIX + context.userId(), tokenHash);
            return issue(context.userId(), context.currentCityId(), context.citySelectionPending());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("无法轮换 refresh session", e);
            throw new BusinessException(503, "认证会话服务暂不可用，请稍后重试");
        }
    }

    public void revokeAll(Integer userId) {
        try {
            Set<String> hashes = redisTemplate.opsForSet().members(USER_PREFIX + userId);
            if (hashes != null && !hashes.isEmpty()) {
                redisTemplate.delete(hashes.stream().map(REFRESH_PREFIX::concat).toList());
            }
            redisTemplate.delete(USER_PREFIX + userId);
        } catch (Exception e) {
            log.warn("撤销 refresh session 失败，token_version 仍会使 access token 失效: {}", e.getMessage());
        }
    }

    private RefreshContext parse(String value) {
        String[] parts = value.split(":", -1);
        if (parts.length != 3) {
            throw BusinessException.unauthorized("refresh session 数据无效");
        }
        Integer cityId = parts[1].isBlank() ? null : Integer.valueOf(parts[1]);
        return new RefreshContext(Integer.valueOf(parts[0]), cityId, Boolean.parseBoolean(parts[2]));
    }

    private String sha256(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public record RefreshContext(
            Integer userId, Integer currentCityId, boolean citySelectionPending) {
    }

    public record IssuedRefreshSession(String rawToken, RefreshContext context) {
    }
}
