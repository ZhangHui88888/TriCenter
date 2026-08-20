package com.tricenter.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.AuditOutbox;
import com.tricenter.mapper.AuditOutboxMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Qualifier;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditOutboxWorker {

    private final AuditOutboxMapper outboxMapper;
    private final OperationLogService operationLogService;
    private final ObjectMapper objectMapper;

    @Qualifier("auditExecutor")
    private final Executor auditExecutor;

    @Scheduled(fixedDelayString = "${tricenter.audit.poll-delay-ms:5000}")
    public void poll() {
        LocalDateTime now = LocalDateTime.now();
        outboxMapper.update(null,
                new LambdaUpdateWrapper<AuditOutbox>()
                        .eq(AuditOutbox::getStatus, "PROCESSING")
                        .le(AuditOutbox::getAvailableAt, now)
                        .set(AuditOutbox::getStatus, "PENDING")
                        .set(AuditOutbox::getLastError, "recovered stale worker claim"));
        List<AuditOutbox> pending = outboxMapper.selectList(
                new LambdaQueryWrapper<AuditOutbox>()
                        .eq(AuditOutbox::getStatus, "PENDING")
                        .le(AuditOutbox::getAvailableAt, now)
                        .orderByAsc(AuditOutbox::getId)
                        .last("LIMIT 100"));
        pending.forEach(event -> auditExecutor.execute(() -> process(event)));
    }

    public void process(AuditOutbox event) {
        int claimed = outboxMapper.update(null,
                new LambdaUpdateWrapper<AuditOutbox>()
                        .eq(AuditOutbox::getId, event.getId())
                        .eq(AuditOutbox::getStatus, "PENDING")
                        .set(AuditOutbox::getStatus, "PROCESSING")
                        .set(AuditOutbox::getAvailableAt, LocalDateTime.now().plusMinutes(5)));
        if (claimed != 1) return;

        try {
            Map<String, Object> payload = objectMapper.readValue(
                    event.getPayload(), new TypeReference<>() {});
            operationLogService.log(
                    integer(payload.get("userId")), integer(payload.get("cityId")),
                    string(payload.get("username")), string(payload.get("operation")),
                    string(payload.get("targetType")), string(payload.get("targetId")),
                    string(payload.get("targetName")), string(payload.get("detail")),
                    string(payload.get("ipAddress")));
            outboxMapper.update(null, new LambdaUpdateWrapper<AuditOutbox>()
                    .eq(AuditOutbox::getId, event.getId())
                    .set(AuditOutbox::getStatus, "DONE")
                    .set(AuditOutbox::getProcessedAt, LocalDateTime.now())
                    .set(AuditOutbox::getLastError, null));
        } catch (Exception e) {
            int attempts = (event.getAttempts() == null ? 0 : event.getAttempts()) + 1;
            String status = attempts >= 10 ? "FAILED" : "PENDING";
            outboxMapper.update(null, new LambdaUpdateWrapper<AuditOutbox>()
                    .eq(AuditOutbox::getId, event.getId())
                    .set(AuditOutbox::getStatus, status)
                    .set(AuditOutbox::getAttempts, attempts)
                    .set(AuditOutbox::getAvailableAt,
                            LocalDateTime.now().plusSeconds(Math.min(300, 1L << Math.min(attempts, 8))))
                    .set(AuditOutbox::getLastError, truncate(e.getMessage())));
            log.warn("审计 outbox 处理失败: eventId={}, attempts={}", event.getEventId(), attempts);
        }
    }

    private Integer integer(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private String string(Object value) {
        return value == null ? null : value.toString();
    }

    private String truncate(String value) {
        if (value == null) return "unknown";
        return value.length() <= 1000 ? value : value.substring(0, 1000);
    }
}
