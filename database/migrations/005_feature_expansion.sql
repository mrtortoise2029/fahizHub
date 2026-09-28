USE fahizhub;

SET @project_fields = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='projects' AND COLUMN_NAME='video_url')=0,
  'ALTER TABLE projects ADD COLUMN video_url VARCHAR(500) NULL AFTER live_url, ADD COLUMN architecture TEXT NULL AFTER contribution, ADD COLUMN outcomes TEXT NULL AFTER architecture, ADD COLUMN publish_at DATETIME NULL AFTER is_published, ADD COLUMN expires_at DATETIME NULL AFTER publish_at',
  'SELECT 1'
);
PREPARE project_fields_statement FROM @project_fields;
EXECUTE project_fields_statement;
DEALLOCATE PREPARE project_fields_statement;

SET @achievement_schedule = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='achievements' AND COLUMN_NAME='publish_at')=0,
  'ALTER TABLE achievements ADD COLUMN publish_at DATETIME NULL AFTER is_published, ADD COLUMN expires_at DATETIME NULL AFTER publish_at',
  'SELECT 1'
);
PREPARE achievement_schedule_statement FROM @achievement_schedule;
EXECUTE achievement_schedule_statement;
DEALLOCATE PREPARE achievement_schedule_statement;

SET @service_schedule = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='services' AND COLUMN_NAME='publish_at')=0,
  'ALTER TABLE services ADD COLUMN publish_at DATETIME NULL AFTER is_published, ADD COLUMN expires_at DATETIME NULL AFTER publish_at',
  'SELECT 1'
);
PREPARE service_schedule_statement FROM @service_schedule;
EXECUTE service_schedule_statement;
DEALLOCATE PREPARE service_schedule_statement;

SET @email_retry = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='email_log' AND COLUMN_NAME='body')=0,
  'ALTER TABLE email_log ADD COLUMN body TEXT NULL AFTER subject, ADD COLUMN attempts TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER status, ADD COLUMN last_attempt_at DATETIME NULL AFTER attempts',
  'SELECT 1'
);
PREPARE email_retry_statement FROM @email_retry;
EXECUTE email_retry_statement;
DEALLOCATE PREPARE email_retry_statement;

SET @user_2fa = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='two_factor_secret')=0,
  'ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) NULL, ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE',
  'SELECT 1'
);
PREPARE user_2fa_statement FROM @user_2fa;
EXECUTE user_2fa_statement;
DEALLOCATE PREPARE user_2fa_statement;

CREATE TABLE IF NOT EXISTS content_versions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(60) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  snapshot JSON NOT NULL,
  change_note VARCHAR(255),
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_versions_entity(entity_type,entity_id,created_at),
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60),
  entity_id BIGINT UNSIGNED NULL,
  metadata JSON,
  ip_address VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_date(created_at),
  INDEX idx_audit_user(user_id,created_at),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(64),
  last_seen_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user(user_id,revoked_at,expires_at),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  interaction_id VARCHAR(255),
  rating ENUM('helpful','not_helpful') NOT NULL,
  question TEXT,
  comment VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_feedback_date(created_at)
);

CREATE TABLE IF NOT EXISTS backup_runs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  size_bytes BIGINT UNSIGNED,
  status ENUM('running','completed','failed') NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  INDEX idx_backup_date(created_at)
);
