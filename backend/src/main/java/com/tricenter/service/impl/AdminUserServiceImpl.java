package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.AdminUserCreateRequest;
import com.tricenter.dto.request.AdminUserUpdateRequest;
import com.tricenter.dto.response.AdminUserResponse;
import com.tricenter.dto.response.CityInfoResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.entity.UserCity;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.UserCityMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private static final Set<String> VALID_ROLES = Set.of("admin", "manager", "user");

    private final UserMapper userMapper;
    private final UserCityMapper userCityMapper;
    private final CityMapper cityMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<AdminUserResponse> listUsers() {
        Map<Integer, City> cityMap = cityMapper.selectList(
                        new LambdaQueryWrapper<City>().orderByAsc(City::getSortOrder, City::getId))
                .stream()
                .collect(Collectors.toMap(City::getId, Function.identity()));
        return userMapper.selectList(
                        new LambdaQueryWrapper<User>().orderByAsc(User::getId))
                .stream()
                .map(user -> toResponse(user, authorizedCityIds(user.getId()), cityMap))
                .toList();
    }

    @Override
    public List<CityInfoResponse> listCities() {
        return cityMapper.selectList(
                        new LambdaQueryWrapper<City>()
                                .eq(City::getStatus, 1)
                                .orderByAsc(City::getSortOrder, City::getId))
                .stream()
                .map(city -> new CityInfoResponse(city.getId(), city.getCode(), city.getName()))
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        Long duplicateCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername().trim()));
        if (duplicateCount > 0) {
            throw BusinessException.badRequest("用户名已存在");
        }
        int status = request.getStatus() == null ? 1 : request.getStatus();
        List<Integer> cityIds = normalizeAndValidate(request.getCityIds(), status);
        validateRole(request.getRole());

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName().trim());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setStatus(status);
        userMapper.insert(user);
        replaceAuthorizations(user.getId(), cityIds);
        return getUserResponse(user.getId());
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Integer userId, AdminUserUpdateRequest request,
                                        Integer operatorId, Integer operatorCurrentCityId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        if (userId.equals(operatorId) && Integer.valueOf(0).equals(request.getStatus())) {
            throw BusinessException.badRequest("不能禁用当前登录账号");
        }
        List<Integer> cityIds = normalizeAndValidate(request.getCityIds(), request.getStatus());
        if (userId.equals(operatorId) && !cityIds.contains(operatorCurrentCityId)) {
            throw BusinessException.badRequest("不能删除自己当前正在使用的城市权限");
        }
        validateRole(request.getRole());

        user.setName(request.getName().trim());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setStatus(request.getStatus());
        userMapper.updateById(user);
        replaceAuthorizations(userId, cityIds);
        return getUserResponse(userId);
    }

    @Override
    public void resetPassword(Integer userId, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }

    private void validateRole(String role) {
        if (!VALID_ROLES.contains(role)) {
            throw BusinessException.badRequest("无效的用户角色");
        }
    }

    private List<Integer> normalizeAndValidate(List<Integer> requestedCityIds, Integer status) {
        List<Integer> cityIds = requestedCityIds == null
                ? List.of()
                : List.copyOf(new LinkedHashSet<>(requestedCityIds));
        if (Integer.valueOf(1).equals(status) && cityIds.isEmpty()) {
            throw BusinessException.badRequest("启用中的账号至少需要一个有效城市");
        }
        if (!cityIds.isEmpty()) {
            long validCount = cityMapper.selectBatchIds(cityIds).stream()
                    .filter(city -> Integer.valueOf(1).equals(city.getStatus()))
                    .count();
            if (validCount != cityIds.size()) {
                throw BusinessException.badRequest("包含无效或已停用的城市");
            }
        }
        return cityIds;
    }

    private void replaceAuthorizations(Integer userId, List<Integer> cityIds) {
        userCityMapper.delete(
                new LambdaQueryWrapper<UserCity>().eq(UserCity::getUserId, userId));
        for (Integer cityId : cityIds) {
            UserCity userCity = new UserCity();
            userCity.setUserId(userId);
            userCity.setCityId(cityId);
            userCityMapper.insert(userCity);
        }
    }

    private AdminUserResponse getUserResponse(Integer userId) {
        User user = userMapper.selectById(userId);
        List<Integer> cityIds = authorizedCityIds(userId);
        Map<Integer, City> cityMap = cityIds.isEmpty()
                ? Map.of()
                : cityMapper.selectBatchIds(cityIds).stream()
                        .collect(Collectors.toMap(City::getId, Function.identity()));
        return toResponse(user, cityIds, cityMap);
    }

    private List<Integer> authorizedCityIds(Integer userId) {
        return userCityMapper.selectList(
                        new LambdaQueryWrapper<UserCity>()
                                .eq(UserCity::getUserId, userId)
                                .orderByAsc(UserCity::getCityId))
                .stream()
                .map(UserCity::getCityId)
                .toList();
    }

    private AdminUserResponse toResponse(User user, List<Integer> cityIds, Map<Integer, City> cityMap) {
        List<CityInfoResponse> cities = cityIds.stream()
                .map(cityMap::get)
                .filter(java.util.Objects::nonNull)
                .map(city -> new CityInfoResponse(city.getId(), city.getCode(), city.getName()))
                .toList();
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole())
                .phone(user.getPhone())
                .email(user.getEmail())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .cityIds(cityIds)
                .cities(cities)
                .build();
    }
}
