package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 产品品类实体
 */
@Data
@TableName("product_categories")
public class ProductCategory {
    
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
    private List<ProductCategory> children;
}
