package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 树形节点响应DTO（用于行业分类和产品品类）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreeNodeResponse {
    
    private Integer id;
    
    private String name;
    
    private Integer level;
    
    private Integer parentId;
    
    private List<TreeNodeResponse> children;
}
