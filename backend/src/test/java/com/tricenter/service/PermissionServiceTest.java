package com.tricenter.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionServiceTest {

    private final PermissionService permissionService = new PermissionService();

    @Test
    void regularUserCanEditButCannotCreateDeleteImportOrExportEnterprises() {
        assertThat(permissionService.getPermissions("user"))
                .contains("enterprise:view", "enterprise:edit", "followup:manage")
                .doesNotContain(
                        "enterprise:create",
                        "enterprise:delete",
                        "enterprise:batch",
                        "enterprise:import",
                        "enterprise:export",
                        "user:manage",
                        "dictionary:manage");
    }

    @Test
    void managerCannotManageUsersOrDictionaries() {
        assertThat(permissionService.getPermissions("manager"))
                .contains(
                        "enterprise:create",
                        "enterprise:delete",
                        "enterprise:batch",
                        "enterprise:import",
                        "enterprise:export")
                .doesNotContain("user:manage", "dictionary:manage");
    }

    @Test
    void adminCanManageUsersAndDictionaries() {
        assertThat(permissionService.getPermissions("admin"))
                .contains("user:manage", "dictionary:manage");
    }
}
