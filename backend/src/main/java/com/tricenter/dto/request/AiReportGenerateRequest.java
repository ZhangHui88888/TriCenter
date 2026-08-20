package com.tricenter.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiReportGenerateRequest {

    @NotNull
    @Positive
    private Integer enterpriseId;

    @NotBlank
    @Pattern(regexp = "basic|deep", message = "version 必须是 basic 或 deep")
    private String version;

    @NotBlank(message = "providerApiKey 不能为空")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String providerApiKey;
}
