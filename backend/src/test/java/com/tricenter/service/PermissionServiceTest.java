package com.tricenter.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionServiceTest {

    private final PermissionService permissionService = new PermissionService();

    @Test
    void regularUserCanEditButCannotCreateDeleteImportOrExportEnterprises() {
        assertThat(permissionService.getPermissions("user"))
                .contains(
                        "enterprise:view",
                        "enterprise:edit",
                        "followup:manage",
                        "provider:view",
                        "report:view",
                        "report:generate")
                .doesNotContain(
                        "enterprise:create",
                        "enterprise:delete",
                        "enterprise:batch",
                        "enterprise:import",
                        "enterprise:export",
                        "user:manage",
                        "dictionary:manage",
                        "provider:manage",
                        "audit:view");
    }

    @Test
    void managerCannotManageUsersOrDictionaries() {
        assertThat(permissionService.getPermissions("manager"))
                .contains(
                        "enterprise:create",
                        "enterprise:delete",
                        "enterprise:batch",
                        "enterprise:import",
                        "enterprise:export",
                        "provider:view",
                        "provider:manage",
                        "report:view",
                        "report:generate")
                .doesNotContain("user:manage", "dictionary:manage", "audit:view");
    }

    @Test
    void adminCanManageUsersAndDictionaries() {
        assertThat(permissionService.getPermissions("admin"))
                .contains(
                        "user:manage",
                        "dictionary:manage",
                        "provider:view",
                        "provider:manage",
                        "audit:view",
                        "report:view",
                        "report:generate");
    }
}
