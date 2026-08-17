package com.tricenter.config;

import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.UserCityMapper;
import com.tricenter.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class DataInitializerTest {

    @Test
    void restartDoesNotRestoreAuthorizationForExistingAdmin() {
        UserMapper userMapper = mock(UserMapper.class);
        CityMapper cityMapper = mock(CityMapper.class);
        UserCityMapper userCityMapper = mock(UserCityMapper.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        DataInitializer initializer = new DataInitializer(
                userMapper, cityMapper, userCityMapper, passwordEncoder);

        City changzhou = city(1, "changzhou");
        City suzhou = city(2, "suzhou");
        when(cityMapper.selectOne(any())).thenReturn(changzhou, suzhou);

        User existingAdmin = new User();
        existingAdmin.setId(1);
        existingAdmin.setUsername("admin");
        when(userMapper.selectOne(any())).thenReturn(existingAdmin);

        initializer.run();

        verifyNoInteractions(userCityMapper);
    }

    private City city(int id, String code) {
        City city = new City();
        city.setId(id);
        city.setCode(code);
        city.setStatus(1);
        return city;
    }
}
