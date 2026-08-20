package com.tricenter.validation;

import com.tricenter.dto.request.EnterpriseQueryRequest;
import com.tricenter.dto.request.FollowUpQueryRequest;
import com.tricenter.dto.request.ProviderQueryRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PaginationValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void allPagedQueriesRejectZeroAndMoreThanOneHundredRows() {
        EnterpriseQueryRequest enterprise = new EnterpriseQueryRequest();
        enterprise.setPage(0);
        enterprise.setPageSize(101);

        FollowUpQueryRequest followUp = new FollowUpQueryRequest();
        followUp.setPage(0);
        followUp.setPageSize(101);

        ProviderQueryRequest provider = new ProviderQueryRequest();
        provider.setPage(0);
        provider.setPageSize(101);

        assertThat(validator.validate(enterprise)).hasSize(2);
        assertThat(validator.validate(followUp)).hasSize(2);
        assertThat(validator.validate(provider)).hasSize(2);
    }
}
