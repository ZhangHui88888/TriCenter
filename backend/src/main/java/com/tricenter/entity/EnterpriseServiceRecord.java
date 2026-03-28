package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@TableName(value = "enterprise_service_records", autoResultMap = true)
public class EnterpriseServiceRecord {

    @TableId(type = IdType.AUTO)
    private Integer id;

    private Integer enterpriseId;

    private Integer providerId;

    private String serviceType;

    private String serviceName;

    private LocalDate serviceDate;

    private String status;

    private Integer responsibleId;

    private String contractNo;

    private String description;

    private String result;

    private String stageFrom;

    private String stageTo;

    private String projectLevel;

    private BigDecimal feasibilityScore;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> assessmentData;

    /** 附件元数据列表（文件存磁盘，此处仅存 storedFileName 等） */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Map<String, Object>> attachments;

    private Integer benchmarkPossibility;

    @TableLogic
    private Integer isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ---------- 非数据库字段，用于关联查询 ----------

    @TableField(exist = false)
    private String enterpriseName;

    @TableField(exist = false)
    private String providerName;

    @TableField(exist = false)
    private String responsibleName;
}
