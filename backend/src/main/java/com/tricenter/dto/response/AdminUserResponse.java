package com.tricenter.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminUserResponse {

    private Integer id;
    private String username;
    private String name;
    private String role;
    private String phone;
    private String email;
    private Integer status;
    private LocalDateTime lastLoginAt;
    private List<Integer> cityIds;
    private List<CityInfoResponse> cities;
}
