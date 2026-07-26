-- migrate up
-- Creates the local TriCenter database used by backend/src/main/resources/application-dev.yml.
CREATE DATABASE IF NOT EXISTS `tricenter`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- migrate down
-- Execute this rollback only after confirming that the local development data is no longer needed.
DROP DATABASE IF EXISTS `tricenter`;
