package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.OperationLog;
import com.tricenter.mapper.OperationLogMapper;
import com.tricenter.service.OperationLogService;
import com.tricenter.security.CityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 操作日志服务实现
 */
@Service
@RequiredArgsConstructor
public class OperationLogServiceImpl implements OperationLogService {

    private final OperationLogMapper operationLogMapper;
    private final CityContext cityContext;

    @Override
    public void log(Integer userId, Integer cityId, String username, String operation, String targetType,
                    String targetId, String targetName, String detail, String ipAddress) {
        OperationLog logEntry = new OperationLog();
        logEntry.setUserId(userId);
        logEntry.setCityId(cityId);
        logEntry.setUsername(username);
        logEntry.setOperation(operation);
        logEntry.setTargetType(targetType);
        logEntry.setTargetId(targetId);
        logEntry.setTargetName(targetName);
        logEntry.setDetail(detail);
        logEntry.setIpAddress(ipAddress);
        operationLogMapper.insert(logEntry);
    }

    @Override
    public Page<OperationLog> getLogList(int page, int size, String targetType, String operation) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();
        Integer cityId = cityContext.requireCityId();
        wrapper.and(scope -> scope.eq(OperationLog::getCityId, cityId)
                .or()
                .isNull(OperationLog::getCityId));
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
