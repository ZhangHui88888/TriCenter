package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统选项实体
 */
@Data
@TableName("system_options")
public class SystemOption {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String category;
    
    private String value;
    
    private String label;
    
    private String color;
    
    private Integer sortOrder;
    
    private Integer isEnabled;
    
    private LocalDateTime createdAt;
}
