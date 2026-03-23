package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreeCategoryResponse {

    private Integer id;

    private Integer parentId;

    private String name;

    private Integer level;

    private String path;

    private Integer sortOrder;

    private Integer isEnabled;

    private LocalDateTime createdAt;
}
