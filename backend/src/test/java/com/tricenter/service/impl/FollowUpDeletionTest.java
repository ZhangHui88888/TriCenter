package com.tricenter.service.impl;

import com.tricenter.entity.FollowUpRecord;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.mapper.StageChangeLogMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.DashboardCacheInvalidator;
import org.apache.ibatis.annotations.Update;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class FollowUpDeletionTest {

    @Test
    void deletesFollowUpAfterUnlinkingStageHistory() throws NoSuchMethodException {
        FollowUpRecordMapper followUps = mock(FollowUpRecordMapper.class);
        StageChangeLogMapper stageLogs = mock(StageChangeLogMapper.class);
        CityContext cityContext = mock(CityContext.class);
        CityAccessService cityAccess = mock(CityAccessService.class);
        DashboardCacheInvalidator cache = mock(DashboardCacheInvalidator.class);
        FollowUpRecord record = new FollowUpRecord();
        record.setId(7);
        record.setEnterpriseId(42);
        when(followUps.selectById(7)).thenReturn(record);
        when(cityContext.requireCityId()).thenReturn(3);

        FollowUpServiceImpl service = new FollowUpServiceImpl(followUps, mock(EnterpriseMapper.class),
                mock(UserMapper.class), stageLogs, cache, cityContext, cityAccess);
        service.deleteFollowUp(7);

        InOrder order = inOrder(cityAccess, stageLogs, followUps, cache);
        order.verify(cityAccess).requireEnterprise(42, 3);
        order.verify(stageLogs).unlinkFollowUp(7);
        order.verify(followUps).deleteById(7);
        order.verify(cache).evictAfterCommit();

        Update sql = StageChangeLogMapper.class.getMethod("unlinkFollowUp", Integer.class)
                .getAnnotation(Update.class);
        assertThat(sql.value()).containsExactly(
                "UPDATE stage_change_logs SET follow_up_id = NULL WHERE follow_up_id = #{followUpId}");
    }
}
