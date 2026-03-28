package com.tricenter.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.common.result.PageResult;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseServiceRecord;
import com.tricenter.entity.StageChangeLog;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.EnterpriseServiceRecordMapper;
import com.tricenter.mapper.StageChangeLogMapper;
import com.tricenter.service.DashboardService;
import com.tricenter.service.EnterpriseServiceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnterpriseServiceRecordServiceImpl implements EnterpriseServiceRecordService {

    private final EnterpriseServiceRecordMapper serviceRecordMapper;
    private final EnterpriseMapper enterpriseMapper;
    private final StageChangeLogMapper stageChangeLogMapper;
    private final DashboardService dashboardService;

    @Override
    public List<EnterpriseServiceRecord> getByEnterpriseId(Integer enterpriseId) {
        checkEnterpriseExists(enterpriseId);
        return serviceRecordMapper.selectByEnterpriseId(enterpriseId);
    }

    @Override
    public PageResult<EnterpriseServiceRecord> getGlobalPage(int page, int pageSize,
                                                              Integer enterpriseId, Integer providerId,
                                                              String serviceType, String status) {
        Page<EnterpriseServiceRecord> pageParam = new Page<>(page, pageSize);
        IPage<EnterpriseServiceRecord> pageResult = serviceRecordMapper.selectGlobalPage(pageParam, enterpriseId, providerId, serviceType, status);

        return PageResult.of(pageResult.getRecords(), pageResult.getTotal(), page, pageSize);
    }

    @Override
    @Transactional
    public EnterpriseServiceRecord create(Integer enterpriseId, EnterpriseServiceRecord body, Integer currentUserId) {
        Enterprise enterprise = checkEnterpriseExists(enterpriseId);

        body.setEnterpriseId(enterpriseId);
        if (body.getResponsibleId() == null && currentUserId != null) {
            body.setResponsibleId(currentUserId);
        }

        if (StringUtils.hasText(body.getStageTo())) {
            body.setStageFrom(enterprise.getStage());
            enterprise.setStage(body.getStageTo());
            enterpriseMapper.updateById(enterprise);
        }

        serviceRecordMapper.insert(body);

        if (StringUtils.hasText(body.getStageTo()) && !body.getStageTo().equals(body.getStageFrom())) {
            StageChangeLog log = new StageChangeLog();
            log.setEnterpriseId(enterpriseId);
            log.setStageFrom(body.getStageFrom());
            log.setStageTo(body.getStageTo());
            log.setOperatorId(currentUserId);
            stageChangeLogMapper.insert(log);
        }

        dashboardService.evictAllCache();
        return serviceRecordMapper.selectByEnterpriseId(enterpriseId).stream()
                .filter(r -> r.getId().equals(body.getId()))
                .findFirst().orElse(body);
    }

    @Override
    @Transactional
    public EnterpriseServiceRecord update(Integer enterpriseId, Integer id, EnterpriseServiceRecord updated) {
        EnterpriseServiceRecord existing = serviceRecordMapper.selectById(id);
        if (existing == null || Integer.valueOf(1).equals(existing.getIsDeleted())) {
            throw new BusinessException("服务记录不存在");
        }
        if (!existing.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("服务记录不属于该企业");
        }

        if (StringUtils.hasText(updated.getServiceType())) existing.setServiceType(updated.getServiceType());
        if (StringUtils.hasText(updated.getServiceName())) existing.setServiceName(updated.getServiceName());
        if (updated.getServiceDate() != null) existing.setServiceDate(updated.getServiceDate());
        if (StringUtils.hasText(updated.getStatus())) existing.setStatus(updated.getStatus());
        if (updated.getProviderId() != null) existing.setProviderId(updated.getProviderId());
        if (updated.getResponsibleId() != null) existing.setResponsibleId(updated.getResponsibleId());
        existing.setContractNo(updated.getContractNo());
        existing.setDescription(updated.getDescription());
        existing.setResult(updated.getResult());
        existing.setAssessmentData(updated.getAssessmentData());
        existing.setFeasibilityScore(updated.getFeasibilityScore());
        existing.setProjectLevel(updated.getProjectLevel());
        if (updated.getAttachments() != null) {
            existing.setAttachments(updated.getAttachments());
        }
        existing.setBenchmarkPossibility(updated.getBenchmarkPossibility());

        if (StringUtils.hasText(updated.getStageTo())) {
            Enterprise enterprise = checkEnterpriseExists(enterpriseId);
            existing.setStageFrom(enterprise.getStage());
            existing.setStageTo(updated.getStageTo());
            enterprise.setStage(updated.getStageTo());
            enterpriseMapper.updateById(enterprise);
        }

        serviceRecordMapper.updateById(existing);
        dashboardService.evictAllCache();

        return serviceRecordMapper.selectByEnterpriseId(enterpriseId).stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElse(existing);
    }

    @Override
    @Transactional
    public void delete(Integer enterpriseId, Integer id) {
        EnterpriseServiceRecord existing = serviceRecordMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException("服务记录不存在");
        }
        if (!existing.getEnterpriseId().equals(enterpriseId)) {
            throw new BusinessException("服务记录不属于该企业");
        }
        serviceRecordMapper.deleteById(id);
        dashboardService.evictAllCache();
    }

    private Enterprise checkEnterpriseExists(Integer enterpriseId) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null || Integer.valueOf(1).equals(enterprise.getIsDeleted())) {
            throw new BusinessException("企业不存在");
        }
        return enterprise;
    }
}
