USE fahizhub;

INSERT INTO availability(day_of_week,start_time,end_time,timezone,is_active)
SELECT days.day_of_week,'23:00:00','00:00:00','Asia/Dhaka',TRUE
FROM (
  SELECT 0 day_of_week UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
  SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) days
WHERE NOT EXISTS (
  SELECT 1 FROM availability existing
  WHERE existing.day_of_week=days.day_of_week
    AND existing.start_time='23:00:00'
    AND existing.end_time='00:00:00'
    AND existing.timezone='Asia/Dhaka'
);
