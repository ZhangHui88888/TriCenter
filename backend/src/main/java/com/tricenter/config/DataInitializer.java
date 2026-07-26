package com.tricenter.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.entity.City;
import com.tricenter.entity.User;
import com.tricenter.entity.UserCity;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.mapper.UserCityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化器 - 应用启动时初始化默认数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final CityMapper cityMapper;
    private final UserCityMapper userCityMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initCities();
        initAdminUser();
    }

    private void initCities() {
        ensureCity("changzhou", "常州", 10);
        ensureCity("suzhou", "苏州", 20);
    }

    private void ensureCity(String code, String name, int sortOrder) {
        City city = cityMapper.selectOne(
                new LambdaQueryWrapper<City>().eq(City::getCode, code));
        if (city == null) {
            city = new City();
            city.setCode(code);
            city.setName(name);
            city.setStatus(1);
            city.setSortOrder(sortOrder);
            cityMapper.insert(city);
        }
    }

    /**
     * 初始化管理员用户
     */
    private void initAdminUser() {
        // 检查是否已存在admin用户
        User existingAdmin = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, "admin")
        );
        
        if (existingAdmin == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("系统管理员");
            admin.setRole("admin");
            admin.setPhone("13800000000");
            admin.setEmail("admin@tricenter.com");
            admin.setStatus(1);
            
            userMapper.insert(admin);
            ensureChangzhouAccess(admin.getId());
            log.info("初始化管理员用户成功: admin / admin123");
        } else {
            ensureChangzhouAccess(existingAdmin.getId());
            log.debug("管理员用户已存在，跳过初始化（不覆盖密码）");
        }
    }

    private void ensureChangzhouAccess(Integer userId) {
        City changzhou = cityMapper.selectOne(
                new LambdaQueryWrapper<City>().eq(City::getCode, "changzhou"));
        Long count = userCityMapper.selectCount(
                new LambdaQueryWrapper<UserCity>()
                        .eq(UserCity::getUserId, userId)
                        .eq(UserCity::getCityId, changzhou.getId()));
        if (count == 0) {
            UserCity authorization = new UserCity();
            authorization.setUserId(userId);
            authorization.setCityId(changzhou.getId());
            userCityMapper.insert(authorization);
        }
    }
}
