package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 市场调研报告实体
 */
@Data
@TableName("market_reports")
public class MarketReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 关联企业ID */
    private Long enterpriseId;

    /** 报告编号 */
    private String reportNo;

    /** 版本号 */
    private String version;

    /** 报告状态: draft/generating/completed/reviewed */
    private String status;

    /** 报告全部内容（JSON格式，按章节存储） */
    private String reportData;

    /** AI已生成的章节列表，逗号分隔 */
    private String aiGeneratedSections;

    /** 创建人ID */
    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
