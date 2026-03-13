package com.tricenter.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.OperationLog;

/**
 * 操作日志服务接口
 */
public interface OperationLogService {

    /**
     * 记录操作日志
     */
    void log(Integer userId, String username, String operation, String targetType,
             String targetId, String targetName, String detail, String ipAddress);

    /**
     * 分页查询操作日志
     */
    Page<OperationLog> getLogList(int page, int size, String targetType, String operation);
}
