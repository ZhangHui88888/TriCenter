package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求 ↔ 企业画像维度（多对多：一条表示「该需求在选中该维度值时应被推荐」）
 */
@Data
@TableName("requirement_dimension_mapping")
public class RequirementDimensionMapping {

    @TableId(type = IdType.AUTO)
    private Integer id;

    @TableField("requirement_id")
    private String requirementId;

    @TableField("dimension_key")
    private String dimensionKey;

    @TableField("dimension_value")
    private String dimensionValue;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
