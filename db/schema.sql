CREATE DATABASE IF NOT EXISTS leafscan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE leafscan;

-- LeafScan AI — MySQL Schema
-- Run once to initialize the database and all tables.
-- Usage: mysql -u <user> -p < db/schema.sql
--
-- Upgrading from a prior version that already has the `analyses` table?
-- Run this after applying the full schema:
--   ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) AFTER id;
--   ALTER TABLE analyses ADD INDEX IF NOT EXISTS idx_user_id (user_id);

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                 VARCHAR(36)   NOT NULL,
  name               VARCHAR(100)  NOT NULL,
  email              VARCHAR(254)  NOT NULL,
  password_hash      VARCHAR(255)  NOT NULL,
  is_active          TINYINT(1)    NOT NULL DEFAULT 1,
  email_verified_at  DATETIME      NULL,
  last_login_at      DATETIME      NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uq_users_email (email),
  INDEX idx_users_is_active   (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─── Password Reset Tokens ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          VARCHAR(36)  NOT NULL,
  user_id     VARCHAR(36)  NOT NULL,
  token_hash  VARCHAR(64)  NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uq_prt_token_hash (token_hash),
  INDEX idx_prt_user_id         (user_id),
  INDEX idx_prt_expires_at      (expires_at),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─── Sessions (managed by express-mysql-session) ─────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  expires     INT UNSIGNED  NOT NULL,
  data        MEDIUMTEXT    CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id),
  INDEX idx_sessions_expires (expires)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─── Analyses ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analyses (
  id                   VARCHAR(36)      NOT NULL,
  user_id              VARCHAR(36)      NULL,
  date_time            DATETIME         NOT NULL,
  predicted_class      VARCHAR(100)     NOT NULL,
  disease_display_name VARCHAR(100)     NOT NULL,
  confidence           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  image                MEDIUMTEXT,
  original_file_name   VARCHAR(255),
  description          TEXT,
  recommendation       TEXT,
  severity             VARCHAR(10),
  causes               JSON,
  treatment            JSON,
  prevention           JSON,
  probabilities        JSON,
  fallback             TINYINT(1)       NOT NULL DEFAULT 0,
  created_at           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_date_time     (date_time),
  INDEX idx_predicted     (predicted_class(50)),
  INDEX idx_severity      (severity),
  INDEX idx_user_id       (user_id),
  CONSTRAINT fk_analyses_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
