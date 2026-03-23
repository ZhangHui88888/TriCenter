package com.tricenter.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TreeCategoryCreateRequest {

    @NotNull(message = "父级ID不能为空")
    private Integer parentId;

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private Integer sortOrder;

    private Boolean isEnabled;
}
