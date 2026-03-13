package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 操作日志实体
 */
@Data
@TableName("operation_logs")
public class OperationLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 操作人ID */
    private Integer userId;

    /** 操作人用户名 */
    private String username;

    /** 操作类型: CREATE/UPDATE/DELETE/IMPORT/EXPORT/STAGE_CHANGE */
    private String operation;

    /** 操作对象类型: ENTERPRISE/CONTACT/PRODUCT/FOLLOW_UP */
    private String targetType;

    /** 操作对象ID */
    private String targetId;

    /** 操作对象名称 */
    private String targetName;

    /** 操作详情 */
    private String detail;

    /** IP地址 */
    private String ipAddress;

    private LocalDateTime createdAt;
}
