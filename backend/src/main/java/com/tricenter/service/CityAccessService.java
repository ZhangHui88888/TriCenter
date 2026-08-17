package com.tricenter.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.dto.response.CityInfoResponse;
import com.tricenter.entity.City;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.UserCity;
import com.tricenter.mapper.CityMapper;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.UserCityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CityAccessService {

    private final CityMapper cityMapper;
    private final UserCityMapper userCityMapper;
    private final EnterpriseMapper enterpriseMapper;

    public List<CityInfoResponse> getAvailableCities(Integer userId) {
        List<Integer> cityIds = userCityMapper.selectList(
                        new LambdaQueryWrapper<UserCity>()
                                .eq(UserCity::getUserId, userId))
                .stream()
                .map(UserCity::getCityId)
                .toList();
        if (cityIds.isEmpty()) {
            return List.of();
        }
        return cityMapper.selectBatchIds(cityIds).stream()
                .filter(city -> Integer.valueOf(1).equals(city.getStatus()))
                .sorted(Comparator
                        .comparing(City::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(City::getId))
                .map(this::toResponse)
                .toList();
    }

    public City requireAuthorizedCity(Integer userId, Integer cityId) {
        if (cityId == null) {
            throw BusinessException.forbidden("请先选择城市");
        }
        Long authorizationCount = userCityMapper.selectCount(
                new LambdaQueryWrapper<UserCity>()
                        .eq(UserCity::getUserId, userId)
                        .eq(UserCity::getCityId, cityId));
        City city = cityMapper.selectById(cityId);
        if (authorizationCount == 0 || city == null || !Integer.valueOf(1).equals(city.getStatus())) {
            throw BusinessException.forbidden("无权访问该城市");
        }
        return city;
    }

    public City requireCityByCode(String code) {
        City city = cityMapper.selectOne(
                new LambdaQueryWrapper<City>()
                        .eq(City::getCode, code)
                        .eq(City::getStatus, 1));
        if (city == null) {
            throw BusinessException.forbidden("系统城市配置无效");
        }
        return city;
    }

    public City requireActiveCity(Integer cityId) {
        City city = cityMapper.selectById(cityId);
        if (city == null || !Integer.valueOf(1).equals(city.getStatus())) {
            throw BusinessException.forbidden("系统城市配置无效");
        }
        return city;
    }

    public Enterprise requireEnterprise(Integer enterpriseId, Integer cityId) {
        Enterprise enterprise = enterpriseMapper.selectOne(
                new LambdaQueryWrapper<Enterprise>()
                        .eq(Enterprise::getId, enterpriseId)
                        .eq(Enterprise::getCityId, cityId));
        if (enterprise == null) {
            throw BusinessException.notFound("企业不存在");
        }
        return enterprise;
    }

    public CityInfoResponse toResponse(City city) {
        return new CityInfoResponse(city.getId(), city.getCode(), city.getName());
    }
}
