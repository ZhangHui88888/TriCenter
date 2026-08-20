package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.dto.request.AiReportGenerateRequest;
import com.tricenter.dto.response.LoginResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityHardeningTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loginResponseDoesNotSerializeAccessToken() throws Exception {
        LoginResponse response = LoginResponse.builder().token("secret-access-token").build();

        assertThat(objectMapper.writeValueAsString(response))
                .doesNotContain("secret-access-token", "\"token\"");
    }

    @Test
    void providerApiKeyIsDeserializableButNeverSerialized() throws Exception {
        AiReportGenerateRequest request = objectMapper.readValue("""
                {"enterpriseId":12,"version":"basic","providerApiKey":"sk-secret"}
                """, AiReportGenerateRequest.class);

        assertThat(request.getProviderApiKey()).isEqualTo("sk-secret");
        assertThat(objectMapper.writeValueAsString(request)).doesNotContain("sk-secret", "providerApiKey");
    }
}
