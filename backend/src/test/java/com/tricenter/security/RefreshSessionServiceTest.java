package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RefreshSessionServiceTest {

    private ValueOperations<String, String> values;
    private UserMapper userMapper;
    private RefreshSessionService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        values = mock(ValueOperations.class);
        SetOperations<String, String> sets = mock(SetOperations.class);
        userMapper = mock(UserMapper.class);
        when(redisTemplate.opsForValue()).thenReturn(values);
        when(redisTemplate.opsForSet()).thenReturn(sets);
        service = new RefreshSessionService(redisTemplate, userMapper);
    }

    @Test
    void rejectsRefreshSessionIssuedBeforeTokenVersionWasIncremented() {
        when(values.getAndDelete(anyString())).thenReturn("7::false:2");
        User user = enabledUser(7, 3);
        when(userMapper.selectById(7)).thenReturn(user);

        assertThatThrownBy(() -> service.rotate("stolen-refresh-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已撤销");
    }

    @Test
    void rejectsRefreshSessionForDisabledAccount() {
        when(values.getAndDelete(anyString())).thenReturn("7::false:2");
        User user = enabledUser(7, 2);
        user.setStatus(0);
        when(userMapper.selectById(7)).thenReturn(user);

        assertThatThrownBy(() -> service.rotate("disabled-account-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("账号不可用");
    }

    private User enabledUser(int id, int tokenVersion) {
        User user = new User();
        user.setId(id);
        user.setStatus(1);
        user.setTokenVersion(tokenVersion);
        return user;
    }
}
