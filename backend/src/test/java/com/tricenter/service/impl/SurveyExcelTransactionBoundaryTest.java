package com.tricenter.service.impl;

import com.tricenter.mapper.CategoryMapper;
import com.tricenter.mapper.EnterpriseContactMapper;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.EnterpriseProductMapper;
import com.tricenter.mapper.ProviderMapper;
import com.tricenter.mapper.SystemOptionMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.AuditOutboxService;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.DashboardCacheInvalidator;
import com.tricenter.service.OptionsService;
import com.tricenter.service.RequirementMatchEngine;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SurveyExcelTransactionBoundaryTest {

    @Test
    void anyReplacementFailureRollsBackTheWholeEnterpriseBundle() {
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        TransactionStatus status = mock(TransactionStatus.class);
        when(transactionManager.getTransaction(any(TransactionDefinition.class))).thenReturn(status);
        SurveyExcelServiceImpl service = new SurveyExcelServiceImpl(
                mock(EnterpriseMapper.class), mock(EnterpriseContactMapper.class),
                mock(EnterpriseProductMapper.class), mock(CategoryMapper.class),
                mock(SystemOptionMapper.class), mock(ProviderMapper.class), mock(OptionsService.class),
                mock(RequirementMatchEngine.class), mock(CityContext.class),
                mock(CityAccessService.class), mock(DashboardCacheInvalidator.class),
                mock(AuditOutboxService.class), transactionManager);

        assertThatThrownBy(() -> service.inEnterpriseTransaction(() -> {
            throw new IllegalStateException("product insert failed");
        })).isInstanceOf(IllegalStateException.class);

        verify(transactionManager).rollback(status);
    }
}
