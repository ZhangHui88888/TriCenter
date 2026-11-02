package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RefreshSessionServiceTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> values;
    private UserMapper userMapper;
    private RefreshSessionService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        values = mock(ValueOperations.class);
        SetOperations<String, String> sets = mock(SetOperations.class);
        userMapper = mock(UserMapper.class);
        when(redisTemplate.opsForValue()).thenReturn(values);
        when(redisTemplate.opsForSet()).thenReturn(sets);
        service = new RefreshSessionService(redisTemplate, userMapper);
    }

    private void storedSession(String value) {
        when(redisTemplate.execute(eq(RefreshSessionService.GET_AND_DELETE), anyList())).thenReturn(value);
    }

    @Test
    void rejectsRefreshSessionIssuedBeforeTokenVersionWasIncremented() {
        storedSession("7::false:2");
        User user = enabledUser(7, 3);
        when(userMapper.selectById(7)).thenReturn(user);

        assertThatThrownBy(() -> service.rotate("stolen-refresh-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已撤销");
    }

    @Test
    void rejectsRefreshSessionForDisabledAccount() {
        storedSession("7::false:2");
        User user = enabledUser(7, 2);
        user.setStatus(0);
        when(userMapper.selectById(7)).thenReturn(user);

        assertThatThrownBy(() -> service.rotate("disabled-account-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("账号不可用");
    }

    @Test
    void rotatesWithALuaScriptBecauseProductionRedisLacksGetdel() {
        storedSession("7:3:false:2");
        when(userMapper.selectById(7)).thenReturn(enabledUser(7, 2));

        RefreshSessionService.IssuedRefreshSession issued = service.rotate("valid-refresh-token");

        assertThat(issued.context().userId()).isEqualTo(7);
        assertThat(issued.context().currentCityId()).isEqualTo(3);
        assertThat(issued.rawToken()).isNotBlank().isNotEqualTo("valid-refresh-token");
        verify(values, never()).getAndDelete(anyString());
        assertThat(RefreshSessionService.GET_AND_DELETE.getScriptAsString()).doesNotContain("GETDEL");
    }

    @Test
    void unknownRefreshSessionIsUnauthorizedNotServiceUnavailable() {
        storedSession(null);

        assertThatThrownBy(() -> service.rotate("expired-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已失效");
    }

    private User enabledUser(int id, int tokenVersion) {
        User user = new User();
        user.setId(id);
        user.setStatus(1);
        user.setTokenVersion(tokenVersion);
        return user;
    }
}
