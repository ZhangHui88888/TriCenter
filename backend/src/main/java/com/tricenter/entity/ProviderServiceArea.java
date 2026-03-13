package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 服务商服务领域实体
 */
@Data
@TableName("provider_service_areas")
public class ProviderServiceArea {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 服务商ID */
    private Integer providerId;
    
    /** 服务领域名称 */
    private String areaName;
    
    /** 领域描述 */
    private String description;
    
    /** 排序 */
    private Integer sortOrder;
    
    private LocalDateTime createdAt;
}
