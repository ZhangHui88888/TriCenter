package com.tricenter.service;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.AdminUserUpdateRequest;
import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.UserCityMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.impl.AdminUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private UserCityMapper userCityMapper;
    @Mock
    private CityMapper cityMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminUserServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AdminUserServiceImpl(
                userMapper, userCityMapper, cityMapper, passwordEncoder);
    }

    @Test
    void enabledUserMustKeepAtLeastOneCity() {
        User target = enabledAdmin();
        when(userMapper.selectById(target.getId())).thenReturn(target);
        AdminUserUpdateRequest request = validUpdate();
        request.setCityIds(List.of());

        assertThatThrownBy(() -> service.updateUser(
                target.getId(), request, 99, 1))
                .isInstanceOf(BusinessException.class)
                .extracting("code")
                .isEqualTo(400);
    }

    @Test
    void administratorCannotDisableSelf() {
        User target = enabledAdmin();
        when(userMapper.selectById(target.getId())).thenReturn(target);
        AdminUserUpdateRequest request = validUpdate();
        request.setStatus(0);

        assertThatThrownBy(() -> service.updateUser(
                target.getId(), request, target.getId(), 1))
                .isInstanceOf(BusinessException.class)
                .extracting("code")
                .isEqualTo(400);
    }

    @Test
    void administratorCannotRemoveOwnCurrentCity() {
        User target = enabledAdmin();
        City suzhou = new City();
        suzhou.setId(2);
        suzhou.setStatus(1);
        when(userMapper.selectById(target.getId())).thenReturn(target);
        when(cityMapper.selectBatchIds(List.of(2))).thenReturn(List.of(suzhou));
        AdminUserUpdateRequest request = validUpdate();
        request.setCityIds(List.of(2));

        assertThatThrownBy(() -> service.updateUser(
                target.getId(), request, target.getId(), 1))
                .isInstanceOf(BusinessException.class)
                .hasMessage("不能删除自己当前正在使用的城市权限")
                .extracting("code")
                .isEqualTo(400);
    }

    private AdminUserUpdateRequest validUpdate() {
        AdminUserUpdateRequest request = new AdminUserUpdateRequest();
        request.setName("系统管理员");
        request.setRole("admin");
        request.setStatus(1);
        request.setCityIds(List.of(1));
        return request;
    }

    private User enabledAdmin() {
        User user = new User();
        user.setId(1);
        user.setUsername("admin");
        user.setName("系统管理员");
        user.setRole("admin");
        user.setStatus(1);
        return user;
    }
}
