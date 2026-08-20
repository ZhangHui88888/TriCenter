package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("audit_outbox")
public class AuditOutbox {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String eventId;
    private String eventType;
    private String aggregateType;
    private String aggregateId;
    private String payload;
    private String status;
    private Integer attempts;
    private LocalDateTime availableAt;
    private LocalDateTime processedAt;
    private String lastError;
    private LocalDateTime createdAt;
}
