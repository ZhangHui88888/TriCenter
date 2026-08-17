package com.tricenter.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SelectCityRequest {

    @NotNull(message = "请选择城市")
    private Integer cityId;
}
