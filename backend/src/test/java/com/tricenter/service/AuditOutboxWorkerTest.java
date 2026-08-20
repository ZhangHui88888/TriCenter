package com.tricenter.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.AuditOutbox;
import com.tricenter.mapper.AuditOutboxMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.builder.MapperBuilderAssistant;

import java.util.concurrent.Executor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuditOutboxWorkerTest {

    private AuditOutboxMapper outboxMapper;
    private OperationLogService operationLogService;
    private AuditOutboxWorker worker;

    @BeforeEach
    void setUp() {
        MapperBuilderAssistant assistant =
                new MapperBuilderAssistant(new MybatisConfiguration(), "");
        assistant.setCurrentNamespace("com.tricenter.mapper.AuditOutboxMapper");
        TableInfoHelper.initTableInfo(assistant, AuditOutbox.class);
        outboxMapper = mock(AuditOutboxMapper.class);
        operationLogService = mock(OperationLogService.class);
        Executor directExecutor = Runnable::run;
        worker = new AuditOutboxWorker(
                outboxMapper, operationLogService, new ObjectMapper(), directExecutor);
    }

    @Test
    void operationLogFailureReturnsClaimedEventToRetryQueue() {
        AuditOutbox event = event();
        when(outboxMapper.update(isNull(), any())).thenReturn(1);
        org.mockito.Mockito.doThrow(new IllegalStateException("database unavailable"))
                .when(operationLogService)
                .log(any(), any(), any(), any(), any(), any(), any(), any(), any());

        worker.process(event);

        verify(operationLogService).log(
                any(), any(), any(), any(), any(), any(), any(), any(), any());
        verify(outboxMapper, times(2)).update(isNull(), any());
    }

    private AuditOutbox event() {
        AuditOutbox event = new AuditOutbox();
        event.setId(1L);
        event.setEventId("event-id");
        event.setAttempts(0);
        event.setPayload("""
                {"userId":7,"cityId":1,"username":"tester","operation":"UPDATE",
                 "targetType":"ENTERPRISE","targetId":"12","targetName":"Example",
                 "detail":"updated","ipAddress":"127.0.0.1"}
                """);
        return event;
    }
}
