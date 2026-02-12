package com.tricenter.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initAdminUser();
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
            log.info("初始化管理员用户成功: admin / admin123");
        } else {
            // 更新密码为正确的BCrypt哈希
            existingAdmin.setPassword(passwordEncoder.encode("admin123"));
            userMapper.updateById(existingAdmin);
            log.info("管理员用户已存在，已更新密码");
        }
    }
}
