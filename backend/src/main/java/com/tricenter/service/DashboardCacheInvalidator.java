package com.tricenter.service;

import com.tricenter.event.DashboardCacheEvictionRequested;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class DashboardCacheInvalidator {

    private final ApplicationEventPublisher eventPublisher;
    private final DashboardService dashboardService;

    public void evictAfterCommit() {
        eventPublisher.publishEvent(new DashboardCacheEvictionRequested());
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true)
    public void onEvictionRequested(DashboardCacheEvictionRequested ignored) {
        dashboardService.evictAllCache();
    }
}
