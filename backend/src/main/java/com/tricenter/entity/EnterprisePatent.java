package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 企业专利实体
 */
@Data
@TableName("enterprise_patents")
public class EnterprisePatent {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业ID */
    private Integer enterpriseId;
    
    /** 专利名称 */
    private String name;
    
    /** 专利号 */
    private String patentNo;
    
    private LocalDateTime createdAt;
}
