package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CityInfoResponse {

    private Integer id;

    private String code;

    private String name;
}
