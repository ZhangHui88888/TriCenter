package com.tricenter.service;

import com.tricenter.dto.request.AdminUserCreateRequest;
import com.tricenter.dto.request.AdminUserUpdateRequest;
import com.tricenter.dto.response.AdminUserResponse;
import com.tricenter.dto.response.CityInfoResponse;

import java.util.List;

public interface AdminUserService {

    List<AdminUserResponse> listUsers();

    List<CityInfoResponse> listCities();

    AdminUserResponse createUser(AdminUserCreateRequest request);

    AdminUserResponse updateUser(Integer userId, AdminUserUpdateRequest request,
                                 Integer operatorId, Integer operatorCurrentCityId);

    void resetPassword(Integer userId, String newPassword);
}
