package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CityContext {

    public LoginUser requireLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            throw BusinessException.unauthorized("登录状态无效");
        }
        return loginUser;
    }

    public Integer requireCityId() {
        Integer cityId = requireLoginUser().getCurrentCityId();
        if (cityId == null) {
            throw BusinessException.forbidden("请先选择城市");
        }
        return cityId;
    }

    public Integer getUserId() {
        return requireLoginUser().getId();
    }
}
