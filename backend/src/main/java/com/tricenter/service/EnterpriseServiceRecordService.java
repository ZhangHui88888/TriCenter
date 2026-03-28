package com.tricenter.service;

import com.tricenter.common.result.PageResult;
import com.tricenter.entity.EnterpriseServiceRecord;

import java.util.List;

public interface EnterpriseServiceRecordService {

    List<EnterpriseServiceRecord> getByEnterpriseId(Integer enterpriseId);

    PageResult<EnterpriseServiceRecord> getGlobalPage(int page, int pageSize,
                                                       Integer enterpriseId, Integer providerId,
                                                       String serviceType, String status);

    EnterpriseServiceRecord create(Integer enterpriseId, EnterpriseServiceRecord body, Integer currentUserId);

    EnterpriseServiceRecord update(Integer enterpriseId, Integer id, EnterpriseServiceRecord body);

    void delete(Integer enterpriseId, Integer id);
}
