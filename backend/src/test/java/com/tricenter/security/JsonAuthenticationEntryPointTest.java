package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JsonAuthenticationEntryPointTest {

    @Test
    void missingSessionAnswers401SoFrontendRefreshes() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        new JsonAuthenticationEntryPoint(new ObjectMapper()).commence(
                new MockHttpServletRequest("GET", "/api/dashboard/overview"), response,
                new InsufficientAuthenticationException("no access cookie"));

        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("TOKEN_EXPIRED"));
    }
}
