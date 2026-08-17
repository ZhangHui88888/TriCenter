package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_cities")
public class UserCity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Integer userId;

    private Integer cityId;

    private LocalDateTime createdAt;
}
