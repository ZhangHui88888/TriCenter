package com.tricenter.config;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 模拟 axios 行为：GET 拿到 XSRF-TOKEN Cookie，写请求把 Cookie 原值放进 X-XSRF-TOKEN 头。
 */
class CsrfCookieCompatibilityTest {

    @Test
    void rawCookieTokenEchoedInHeaderIsAccepted() throws Exception {
        assertTrue(postPassesCsrf(SecurityConfig.csrfTokenRequestHandler()));
    }

    @Test
    void defaultXorHandlerRejectsRawCookieToken() throws Exception {
        // 线上 403 的原因：默认 XOR 处理器不认 Cookie 原值
        assertFalse(postPassesCsrf(new XorCsrfTokenRequestAttributeHandler()));
    }

    private boolean postPassesCsrf(CsrfTokenRequestHandler handler) throws Exception {
        CsrfFilter filter = new CsrfFilter(CookieCsrfTokenRepository.withHttpOnlyFalse());
        filter.setRequestHandler(handler);

        MockHttpServletResponse getResponse = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest("GET", "/api/follow-ups"), getResponse,
                (req, res) -> ((CsrfToken) req.getAttribute(CsrfToken.class.getName())).getToken());
        Cookie cookie = getResponse.getCookie("XSRF-TOKEN");
        assertNotNull(cookie);

        MockHttpServletRequest post = new MockHttpServletRequest("POST", "/api/follow-ups");
        post.setCookies(cookie);
        post.addHeader("X-XSRF-TOKEN", cookie.getValue());
        MockHttpServletResponse postResponse = new MockHttpServletResponse();
        AtomicBoolean passed = new AtomicBoolean();
        filter.doFilter(post, postResponse, (req, res) -> passed.set(true));
        if (!passed.get()) {
            assertEquals(403, postResponse.getStatus());
        }
        return passed.get();
    }
}
