package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.OperationLog;
import com.tricenter.mapper.OperationLogMapper;
import com.tricenter.service.OperationLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 操作日志服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OperationLogServiceImpl implements OperationLogService {

    private final OperationLogMapper operationLogMapper;

    @Async
    @Override
    public void log(Integer userId, String username, String operation, String targetType,
                    String targetId, String targetName, String detail, String ipAddress) {
        try {
            OperationLog logEntry = new OperationLog();
            logEntry.setUserId(userId);
            logEntry.setUsername(username);
            logEntry.setOperation(operation);
            logEntry.setTargetType(targetType);
            logEntry.setTargetId(targetId);
            logEntry.setTargetName(targetName);
            logEntry.setDetail(detail);
            logEntry.setIpAddress(ipAddress);
            operationLogMapper.insert(logEntry);
        } catch (Exception e) {
            log.error("记录操作日志失败", e);
        }
    }

    @Override
    public Page<OperationLog> getLogList(int page, int size, String targetType, String operation) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(targetType)) {
            wrapper.eq(OperationLog::getTargetType, targetType);
        }
        if (StringUtils.hasText(operation)) {
            wrapper.eq(OperationLog::getOperation, operation);
        }
        wrapper.orderByDesc(OperationLog::getCreatedAt);
        return operationLogMapper.selectPage(new Page<>(page, size), wrapper);
    }
}
