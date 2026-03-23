package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 需求分类实体
 */
@Data
@TableName("requirement_categories")
public class RequirementCategory {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private Integer parentId;
    
    private String name;
    
    private Integer level;
    
    private String path;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
    
    private LocalDateTime createdAt;
    
    @TableField(exist = false)
    private List<RequirementCategory> children;
}
