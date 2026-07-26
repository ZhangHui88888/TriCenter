package com.tricenter.security;

import com.tricenter.entity.User;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.PermissionService;
import com.tricenter.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
/**
 * JWT认证过滤器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final CityAccessService cityAccessService;
    private final PermissionService permissionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                Integer userId = jwtUtil.getUserIdFromToken(token);
                Integer currentCityId = jwtUtil.getCurrentCityIdFromToken(token);
                boolean citySelectionPending = jwtUtil.isCitySelectionPending(token);
                User user = userMapper.selectById(userId);
                if (user == null || !Integer.valueOf(1).equals(user.getStatus())) {
                    filterChain.doFilter(request, response);
                    return;
                }
                if (currentCityId != null) {
                    cityAccessService.requireAuthorizedCity(userId, currentCityId);
                } else if (!citySelectionPending) {
                    filterChain.doFilter(request, response);
                    return;
                }

                LoginUser loginUser = new LoginUser(
                        user.getId(), user.getUsername(), user.getRole(), currentCityId, false);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                            loginUser, null, permissionService.getAuthorities(user.getRole()));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("JWT认证失败: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
