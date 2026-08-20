package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final String PREFIX = "auth:login-failures:";
    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, LocalWindow> fallback = new ConcurrentHashMap<>();

    public void assertAllowed(String ipAddress, String username) {
        String key = key(ipAddress, username);
        try {
            String count = redisTemplate.opsForValue().get(key);
            if (count != null && Integer.parseInt(count) >= MAX_FAILURES) {
                throw new BusinessException(429, "登录失败次数过多，请 15 分钟后再试");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception ignored) {
            LocalWindow window = fallback.get(key);
            if (window != null && !window.expired() && window.failures() >= MAX_FAILURES) {
                throw new BusinessException(429, "登录失败次数过多，请 15 分钟后再试");
            }
        }
    }

    public void recordFailure(String ipAddress, String username) {
        String key = key(ipAddress, username);
        try {
            Long failures = redisTemplate.opsForValue().increment(key);
            if (failures != null && failures == 1) {
                redisTemplate.expire(key, WINDOW);
            }
        } catch (Exception ignored) {
            fallback.compute(key, (ignoredKey, existing) ->
                    existing == null || existing.expired()
                            ? new LocalWindow(1, System.currentTimeMillis() + WINDOW.toMillis())
                            : new LocalWindow(existing.failures() + 1, existing.expiresAt()));
        }
    }

    public void recordSuccess(String ipAddress, String username) {
        String key = key(ipAddress, username);
        try {
            redisTemplate.delete(key);
        } catch (Exception ignored) {
            // The local fallback is still cleared below.
        }
        fallback.remove(key);
    }

    private String key(String ipAddress, String username) {
        String source = String.valueOf(ipAddress) + '|' +
                String.valueOf(username).trim().toLowerCase(Locale.ROOT);
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(source.getBytes(StandardCharsets.UTF_8));
            return PREFIX + HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private record LocalWindow(int failures, long expiresAt) {
        private boolean expired() {
            return System.currentTimeMillis() >= expiresAt;
        }
    }
}
