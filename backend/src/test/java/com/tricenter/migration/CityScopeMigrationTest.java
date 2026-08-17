package com.tricenter.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class CityScopeMigrationTest {

    private static final Path PROJECT_ROOT = Path.of("..").toAbsolutePath().normalize();

    @Test
    void migrationDefinesForwardAndRollbackCityScopeChanges() throws IOException {
        String migration = read("migrations/002_add_city_scope.sql");

        assertThat(migration)
                .contains("-- migrate up")
                .contains("-- migrate down")
                .containsIgnoringCase("CREATE TABLE cities")
                .containsIgnoringCase("CREATE TABLE user_cities")
                .containsIgnoringCase("ADD COLUMN city_id")
                .containsIgnoringCase("MODIFY COLUMN city_id INT NOT NULL")
                .contains("changzhou", "常州", "suzhou", "苏州")
                .containsIgnoringCase("INSERT INTO user_cities");
    }

    @Test
    void freshDatabaseScriptsIncludeCitiesAndDefaultChangzhouOwnership() throws IOException {
        String schema = read("docs/sql/tricenter_schema.sql");
        String init = read("docs/sql/tricenter_init.sql");

        assertThat(schema)
                .containsIgnoringCase("CREATE TABLE cities")
                .containsIgnoringCase("CREATE TABLE user_cities")
                .containsIgnoringCase("city_id")
                .contains("changzhou", "常州", "suzhou", "苏州");
        assertThat(init)
                .containsIgnoringCase("INSERT INTO cities")
                .containsIgnoringCase("INSERT INTO user_cities")
                .containsIgnoringCase("city_id");
    }

    private String read(String relativePath) throws IOException {
        return Files.readString(PROJECT_ROOT.resolve(relativePath));
    }
}
