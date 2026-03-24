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

    /**
     * 仅需求分类（type=requirement）且 level=3 时可能返回：按树内排序推导的标准需求 ID（如 1.1.1），
     * 且 requirements 表中存在该主键时才有值，用于维护画像五维映射。
     */
    private String linkedRequirementId;
}
