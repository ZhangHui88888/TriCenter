-- MANUAL ROLLBACK ONLY. Back up the database and obtain explicit confirmation first.
ALTER TABLE users
    DROP COLUMN must_change_password,
    DROP COLUMN token_version;

