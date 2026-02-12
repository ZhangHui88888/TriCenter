package com.tricenter.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

/**
 * 联系人更新请求
 */
@Data
public class ContactUpdateRequest {
    
    @NotEmpty(message = "联系人列表不能为空")
    @Valid
    private List<ContactItem> contacts;
    
    @Data
    public static class ContactItem {
        private Integer id;
        private String name;
        private String phone;
        private String position;
        private Boolean isPrimary;
        private String email;
        private String wechat;
        private String remark;
    }
}
