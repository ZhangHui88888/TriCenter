package com.tricenter.config;

import com.tricenter.security.CsrfCookieFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * 无状态 JWT 每个请求都会重新认证；XSRF-TOKEN Cookie 不能因此被清掉，
 * 否则下一个写请求没有 Cookie 可比对，会被拒（线上表现为导出等 POST 先 401）。
 */
@SpringJUnitWebConfig(StatelessCsrfCookieTest.TestConfig.class)
class StatelessCsrfCookieTest {

    private static final String TOKEN = "11111111-2222-3333-4444-555555555555";

    @Autowired
    private WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    void authenticatedReadKeepsTheXsrfCookie() throws Exception {
        MvcResult result = mvc.perform(get("/ping").cookie(new Cookie("XSRF-TOKEN", TOKEN))).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        Cookie written = result.getResponse().getCookie("XSRF-TOKEN");
        assertThat(written == null || written.getMaxAge() != 0)
                .as("XSRF-TOKEN must not be cleared (Max-Age=0) on an authenticated request")
                .isTrue();
    }

    @Test
    void twoWritesInARowBothPassWithTheSameCookie() throws Exception {
        for (int i = 0; i < 2; i++) {
            MvcResult result = mvc.perform(post("/ping")
                    .cookie(new Cookie("XSRF-TOKEN", TOKEN))
                    .header("X-XSRF-TOKEN", TOKEN)).andReturn();
            assertThat(result.getResponse().getStatus()).isEqualTo(200);
            Cookie written = result.getResponse().getCookie("XSRF-TOKEN");
            assertThat(written == null || written.getMaxAge() != 0).isTrue();
        }
    }

    @Test
    void writeWithoutMatchingHeaderIsStillRejected() throws Exception {
        MvcResult result = mvc.perform(post("/ping")
                .cookie(new Cookie("XSRF-TOKEN", TOKEN))
                .header("X-XSRF-TOKEN", "forged")).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(403);
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    static class TestConfig {

        @Bean
        SecurityFilterChain chain(HttpSecurity http) throws Exception {
            SecurityConfig.configureStatelessCsrf(http);
            http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .addFilterBefore(new AuthenticateEveryRequest(), UsernamePasswordAuthenticationFilter.class)
                    .addFilterAfter(new CsrfCookieFilter(), AuthenticateEveryRequest.class);
            return http.build();
        }

        @Bean
        PingController pingController() {
            return new PingController();
        }
    }

    /** Stands in for JwtAuthenticationFilter: a valid access cookie authenticates every request. */
    static class AuthenticateEveryRequest extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                    "user", null, AuthorityUtils.createAuthorityList("enterprise:export")));
            chain.doFilter(request, response);
        }
    }

    @RestController
    static class PingController {
        @GetMapping("/ping")
        String get() {
            return "ok";
        }

        @PostMapping("/ping")
        String post() {
            return "ok";
        }
    }
}
