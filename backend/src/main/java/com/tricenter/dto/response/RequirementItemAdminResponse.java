package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementItemAdminResponse {

    private String id;
    private String name;
    private String phase;
    private String category;
    private Integer sortOrder;
    /** 各维度已选 value 列表（与 enterprise 画像维度 key 一致） */
    private Map<String, java.util.List<String>> dimensions;
}
