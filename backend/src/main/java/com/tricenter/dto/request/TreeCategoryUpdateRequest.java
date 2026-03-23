package com.tricenter.dto.request;

import lombok.Data;

@Data
public class TreeCategoryUpdateRequest {

    private String name;

    private Integer sortOrder;

    private Boolean isEnabled;
}
