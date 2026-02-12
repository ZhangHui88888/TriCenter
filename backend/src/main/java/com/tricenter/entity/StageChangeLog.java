package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 阶段变更日志实体
 */
@Data
@TableName("stage_change_logs")
public class StageChangeLog {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业ID */
    private Integer enterpriseId;
    
    /** 变更前阶段 */
    private String stageFrom;
    
    /** 变更后阶段 */
    private String stageTo;
    
    /** 变更原因 */
    private String reason;
    
    /** 操作人ID */
    private Integer operatorId;
    
    /** 关联跟进记录ID */
    private Integer followUpId;
    
    private LocalDateTime createdAt;
}
