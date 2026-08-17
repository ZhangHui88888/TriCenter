package com.tricenter.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AdminUserUpdateRequest {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "角色不能为空")
    private String role;

    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "状态不能为空")
    private Integer status;

    @NotNull(message = "城市权限不能为空")
    private List<Integer> cityIds;
}
