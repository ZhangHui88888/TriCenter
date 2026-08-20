package com.tricenter.dto.response;

import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 登录响应
 */
@Data
@Builder
public class LoginResponse {
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String token;
    private boolean requiresCitySelection;
    private List<CityInfoResponse> availableCities;
    private CityInfoResponse currentCity;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Integer id;
        private String username;
        private String role;
        private String name;
        private List<String> permissions;
    }
}
