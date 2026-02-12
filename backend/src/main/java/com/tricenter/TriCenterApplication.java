package com.tricenter;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 常州跨境电商三中心 - 企业信息管理系统
 * 启动类
 */
@SpringBootApplication
@MapperScan("com.tricenter.mapper")
public class TriCenterApplication {

    public static void main(String[] args) {
        SpringApplication.run(TriCenterApplication.class, args);
    }
}
