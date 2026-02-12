package com.tricenter.dto.response;

import lombok.Data;
import java.util.List;

/**
 * 待跟进提醒响应
 */
@Data
public class PendingFollowUpsResponse {
    
    /** 超过30天未跟进企业数 */
    private Integer overdue30Days;
    
    /** 本周需回访企业数 */
    private Integer needFollowThisWeek;
    
    /** 超期未跟进企业列表 */
    private List<OverdueEnterprise> overdueList;
    
    /** 本周需回访企业列表 */
    private List<WeeklyEnterprise> weeklyList;
    
    @Data
    public static class OverdueEnterprise {
        private Integer id;
        private String name;
        private String lastFollowUp;
        private Integer days;
    }
    
    @Data
    public static class WeeklyEnterprise {
        private Integer id;
        private String name;
        private String nextFollowUp;
        private String type;
    }
}
