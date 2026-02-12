package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 企业联系人实体
 */
@Data
@TableName("enterprise_contacts")
public class EnterpriseContact {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业ID */
    private Integer enterpriseId;
    
    /** 联系人姓名 */
    private String name;
    
    /** 联系电话 */
    private String phone;
    
    /** 职位 */
    private String position;
    
    /** 是否主要联系人 */
    private Integer isPrimary;
    
    /** 邮箱 */
    private String email;
    
    /** 微信 */
    private String wechat;
    
    /** 备注 */
    private String remark;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
