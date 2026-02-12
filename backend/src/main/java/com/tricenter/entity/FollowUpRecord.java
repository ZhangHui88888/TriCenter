package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 跟进记录实体
 */
@Data
@TableName("follow_up_records")
public class FollowUpRecord {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业ID */
    private Integer enterpriseId;
    
    /** 跟进类型: 电话/视频/拜访/会议 */
    private String followType;
    
    /** 跟进日期 */
    private LocalDate followDate;
    
    /** 跟进内容 */
    private String content;
    
    /** 整体状态 */
    private String status;
    
    /** 下一步计划 */
    private String nextPlan;
    
    /** 变更前阶段 */
    private String stageFrom;
    
    /** 变更后阶段 */
    private String stageTo;
    
    /** 跟进人ID */
    private Integer followerId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
