package com.tricenter.service;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.response.CityInfoResponse;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.impl.AuthServiceImpl;
import com.tricenter.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceCitySelectionTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private CityAccessService cityAccessService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userMapper,
                passwordEncoder,
                jwtUtil,
                cityAccessService,
                new PermissionService()
        );
    }

    @Test
    void singleCityUserReceivesActiveTokenImmediately() {
        User user = enabledUser();
        CityInfoResponse changzhou = new CityInfoResponse(1, "changzhou", "常州");
        LoginRequest request = loginRequest();

        when(userMapper.selectOne(any())).thenReturn(user);
        when(passwordEncoder.matches("password", user.getPassword())).thenReturn(true);
        when(cityAccessService.getAvailableCities(user.getId())).thenReturn(List.of(changzhou));
        when(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole(), 1, false))
                .thenReturn("active-token");

        LoginResponse response = authService.login(request);

        assertThat(response.isRequiresCitySelection()).isFalse();
        assertThat(response.getCurrentCity()).isEqualTo(changzhou);
        assertThat(response.getAvailableCities()).containsExactly(changzhou);
        assertThat(response.getToken()).isEqualTo("active-token");
    }

    @Test
    void multiCityUserReceivesPendingTokenUntilSelection() {
        User user = enabledUser();
        CityInfoResponse changzhou = new CityInfoResponse(1, "changzhou", "常州");
        CityInfoResponse suzhou = new CityInfoResponse(2, "suzhou", "苏州");

        when(userMapper.selectOne(any())).thenReturn(user);
        when(passwordEncoder.matches("password", user.getPassword())).thenReturn(true);
        when(cityAccessService.getAvailableCities(user.getId())).thenReturn(List.of(changzhou, suzhou));
        when(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole(), null, true))
                .thenReturn("pending-token");

        LoginResponse response = authService.login(loginRequest());

        assertThat(response.isRequiresCitySelection()).isTrue();
        assertThat(response.getCurrentCity()).isNull();
        assertThat(response.getToken()).isEqualTo("pending-token");
    }

    @Test
    void selectingUnauthorizedCityReturnsForbidden() {
        User user = enabledUser();
        City unauthorized = new City();
        unauthorized.setId(2);

        when(userMapper.selectById(user.getId())).thenReturn(user);
        when(cityAccessService.requireAuthorizedCity(user.getId(), 2))
                .thenThrow(BusinessException.forbidden("无权访问该城市"));

        assertThatThrownBy(() -> authService.selectCity(user.getId(), 2))
                .isInstanceOf(BusinessException.class)
                .extracting("code")
                .isEqualTo(403);
        verify(cityAccessService).requireAuthorizedCity(user.getId(), 2);
    }

    private LoginRequest loginRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsername("manager");
        request.setPassword("password");
        return request;
    }

    private User enabledUser() {
        User user = new User();
        user.setId(7);
        user.setUsername("manager");
        user.setPassword("hash");
        user.setName("业务主管");
        user.setRole("manager");
        user.setStatus(1);
        return user;
    }
}
