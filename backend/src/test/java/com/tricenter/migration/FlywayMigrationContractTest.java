package com.tricenter.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationContractTest {

    @Test
    void baselineAndReferenceSeedAreNonDestructiveAndContainNoUsers() throws IOException {
        String baseline = resource("/db/migration/V001__baseline_current_schema.sql");
        String referenceSeed = resource("/db/migration/V002__seed_reference_data.sql");

        assertThat(baseline.toUpperCase())
                .doesNotContain("DROP ", "TRUNCATE ", "CREATE DATABASE", "INSERT INTO USERS");
        assertThat(referenceSeed.toUpperCase())
                .doesNotContain("DROP ", "TRUNCATE ", "INSERT INTO USERS", "INSERT INTO USER_CITIES");
    }

    @Test
    void migrationChainIsPackagedInOrder() {
        List<String> migrations = List.of(
                "/db/migration/V001__baseline_current_schema.sql",
                "/db/migration/V002__seed_reference_data.sql",
                "/db/migration/V003__add_auth_security_fields.sql",
                "/db/migration/V004__create_audit_outbox.sql");

        assertThat(migrations).allSatisfy(path ->
                assertThat(getClass().getResource(path)).as(path).isNotNull());
    }

    private String resource(String path) throws IOException {
        try (var input = getClass().getResourceAsStream(path)) {
            if (input == null) {
                throw new IOException("Missing test resource: " + path);
            }
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
