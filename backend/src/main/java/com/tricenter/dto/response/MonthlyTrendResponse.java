package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyTrendResponse {
    private String month;
    private int totalNew;
    private int signedNew;
}
