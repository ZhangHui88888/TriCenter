package com.tricenter.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class PermissionService {

    public List<String> getPermissions(String role) {
        Set<String> permissions = new LinkedHashSet<>();
        switch (role == null ? "" : role) {
            case "admin" -> {
                permissions.add("system:manage");
                permissions.add("user:manage");
                permissions.add("dictionary:manage");
                permissions.add("enterprise:view");
                permissions.add("enterprise:create");
                permissions.add("enterprise:edit");
                permissions.add("enterprise:delete");
                permissions.add("enterprise:batch");
                permissions.add("enterprise:import");
                permissions.add("enterprise:export");
                permissions.add("followup:manage");
            }
            case "manager" -> {
                permissions.add("enterprise:view");
                permissions.add("enterprise:create");
                permissions.add("enterprise:edit");
                permissions.add("enterprise:delete");
                permissions.add("enterprise:batch");
                permissions.add("enterprise:import");
                permissions.add("enterprise:export");
                permissions.add("followup:manage");
            }
            case "user" -> {
                permissions.add("enterprise:view");
                permissions.add("enterprise:edit");
                permissions.add("followup:manage");
            }
            default -> {
                // 系统账号只通过 ROLE_SYSTEM 授权。
            }
        }
        return List.copyOf(permissions);
    }

    public List<GrantedAuthority> getAuthorities(String role) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        getPermissions(role).stream()
                .map(SimpleGrantedAuthority::new)
                .forEach(authorities::add);
        return authorities;
    }
}
