USE fahizhub;
SET @add_mark = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='grade_entries' AND COLUMN_NAME='mark')=0,
  'ALTER TABLE grade_entries ADD COLUMN mark DECIMAL(5,2) NULL AFTER credit',
  'SELECT 1'
);
PREPARE add_mark_statement FROM @add_mark;
EXECUTE add_mark_statement;
DEALLOCATE PREPARE add_mark_statement;
