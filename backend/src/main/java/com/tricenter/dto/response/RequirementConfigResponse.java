package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementConfigResponse {

    private List<RequirementItemDTO> requirements;

    private Set<String> universalRequiredIds;

    private Set<String> universalEnhancedIds;

    /** dimensionKey -> dimensionValue -> requirementId[] */
    private Map<String, Map<String, List<String>>> dimensionRequirementMapping;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequirementItemDTO {
        private String id;
        private String name;
        private String description;
        private String phase;
        private String category;
    }
}
