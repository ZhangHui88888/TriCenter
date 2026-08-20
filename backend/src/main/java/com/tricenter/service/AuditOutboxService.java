package com.tricenter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.AuditOutbox;
import com.tricenter.mapper.AuditOutboxMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditOutboxService {

    private final AuditOutboxMapper outboxMapper;
    private final ObjectMapper objectMapper;

    public void enqueue(Integer userId, Integer cityId, String username,
                        String operation, String targetType, String targetId,
                        String targetName, String detail, String ipAddress) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("userId", userId);
            payload.put("cityId", cityId);
            payload.put("username", username);
            payload.put("operation", operation);
            payload.put("targetType", targetType);
            payload.put("targetId", targetId);
            payload.put("targetName", targetName);
            payload.put("detail", detail);
            payload.put("ipAddress", ipAddress);

            AuditOutbox outbox = new AuditOutbox();
            outbox.setEventId(UUID.randomUUID().toString());
            outbox.setEventType("OPERATION_LOG");
            outbox.setAggregateType(targetType);
            outbox.setAggregateId(targetId);
            outbox.setPayload(objectMapper.writeValueAsString(payload));
            outbox.setStatus("PENDING");
            outbox.setAttempts(0);
            outbox.setAvailableAt(LocalDateTime.now());
            outboxMapper.insert(outbox);
        } catch (Exception e) {
            throw new IllegalStateException("无法写入审计 outbox", e);
        }
    }
}
