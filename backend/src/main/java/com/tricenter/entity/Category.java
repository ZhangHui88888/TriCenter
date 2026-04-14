package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 统一分类实体（合并原 industry_categories + product_categories）
 */
@Data
@TableName("categories")
public class Category {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private Integer parentId;
    
    private String name;
    
    private Integer level;
    
    private String path;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
    
    private LocalDateTime createdAt;
    
    /**
     * 子分类列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<Category> children;
}
