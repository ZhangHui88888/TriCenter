package com.tricenter.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.Enterprise;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.UserCityMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.apache.ibatis.builder.MapperBuilderAssistant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CityAccessServiceTest {

    @Test
    void enterpriseLookupAlwaysIncludesTrustedCityId() {
        MapperBuilderAssistant assistant =
                new MapperBuilderAssistant(new MybatisConfiguration(), "");
        assistant.setCurrentNamespace("cityAccessTest");
        TableInfoHelper.initTableInfo(assistant, Enterprise.class);
        CityMapper cityMapper = mock(CityMapper.class);
        UserCityMapper userCityMapper = mock(UserCityMapper.class);
        EnterpriseMapper enterpriseMapper = mock(EnterpriseMapper.class);
        CityAccessService service = new CityAccessService(
                cityMapper, userCityMapper, enterpriseMapper);
        ArgumentCaptor<LambdaQueryWrapper<Enterprise>> wrapperCaptor =
                ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        when(enterpriseMapper.selectOne(wrapperCaptor.capture())).thenReturn(null);

        assertThatThrownBy(() -> service.requireEnterprise(88, 2))
                .isInstanceOf(BusinessException.class)
                .extracting("code")
                .isEqualTo(404);

        verify(enterpriseMapper).selectOne(wrapperCaptor.getValue());
        LambdaQueryWrapper<Enterprise> wrapper = wrapperCaptor.getValue();
        assertThat(wrapper.getSqlSegment()).contains("id", "city_id");
        assertThat(wrapper.getParamNameValuePairs().values()).contains(88, 2);
    }
}
