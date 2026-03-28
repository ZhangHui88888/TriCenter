package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求主表（与 requirements 表对应）
 */
@Data
@TableName("requirements")
public class Requirement {

    @TableId
    private String id;

    private String name;

    private String description;

    @TableField("detail_description")
    private String detailDescription;

    private String phase;

    private String category;

    @TableField("is_universal")
    private Integer isUniversal;

    @TableField("is_enhanced")
    private Integer isEnhanced;

    @TableField("is_custom")
    private Integer isCustom;

    @TableField("enterprise_id")
    private Integer enterpriseId;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("is_recommended")
    private Integer isRecommended;

    @TableField("is_enabled")
    private Integer isEnabled;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
