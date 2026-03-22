package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName(value = "market_reports", autoResultMap = true)
public class MarketReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Integer enterpriseId;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object basicReportData;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object deepReportData;

    private LocalDateTime basicGeneratedAt;

    private LocalDateTime deepGeneratedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
