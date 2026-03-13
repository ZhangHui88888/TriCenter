package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 服务商联系人实体
 */
@Data
@TableName("provider_contacts")
public class ProviderContact {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 服务商ID */
    private Integer providerId;
    
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
