USE fahizhub;
INSERT INTO skill_categories(name,display_order) VALUES ('Languages',1),('Frontend',2),('Backend',3),('Database',4),('Mapping / Data',5),('Tools',6),('Testing',7) ON DUPLICATE KEY UPDATE display_order=VALUES(display_order);
INSERT INTO skills(category_id,name,display_order)
SELECT sc.id, items.name, items.position FROM skill_categories sc JOIN (
  SELECT 'Languages' category,'C' name,1 position UNION ALL SELECT 'Languages','C++',2 UNION ALL SELECT 'Languages','Java',3 UNION ALL SELECT 'Languages','JavaScript',4 UNION ALL SELECT 'Languages','Python',5 UNION ALL SELECT 'Languages','SQL',6 UNION ALL SELECT 'Languages','PHP',7
  UNION ALL SELECT 'Frontend','React',1 UNION ALL SELECT 'Frontend','HTML',2 UNION ALL SELECT 'Frontend','CSS',3 UNION ALL SELECT 'Frontend','Tailwind CSS',4 UNION ALL SELECT 'Frontend','Vite',5
  UNION ALL SELECT 'Backend','Node.js',1 UNION ALL SELECT 'Backend','Express.js',2 UNION ALL SELECT 'Backend','FastAPI',3
  UNION ALL SELECT 'Database','MySQL',1
  UNION ALL SELECT 'Mapping / Data','Leaflet',1 UNION ALL SELECT 'Mapping / Data','React Leaflet',2 UNION ALL SELECT 'Mapping / Data','OpenStreetMap',3 UNION ALL SELECT 'Mapping / Data','Overpass API',4 UNION ALL SELECT 'Mapping / Data','Recharts',5
  UNION ALL SELECT 'Tools','Git',1 UNION ALL SELECT 'Tools','GitHub',2 UNION ALL SELECT 'Tools','Postman',3 UNION ALL SELECT 'Tools','VS Code',4 UNION ALL SELECT 'Tools','Figma',5
  UNION ALL SELECT 'Testing','Jest',1 UNION ALL SELECT 'Testing','Supertest',2 UNION ALL SELECT 'Testing','React Testing Library',3 UNION ALL SELECT 'Testing','Playwright',4 UNION ALL SELECT 'Testing','Vitest',5
) items ON items.category=sc.name ON DUPLICATE KEY UPDATE display_order=VALUES(display_order),is_published=TRUE;
INSERT INTO education(institution,degree,status,credits_completed,cgpa,is_published)
SELECT 'United International University (UIU)','Bachelor of Science in Computer Science and Engineering','3rd year student',62,3.49,TRUE
WHERE NOT EXISTS (SELECT 1 FROM education WHERE institution='United International University (UIU)' AND degree='Bachelor of Science in Computer Science and Engineering');
INSERT INTO experience(organization,title,previous_title,description,is_published)
SELECT 'UIU Computer Club','Head of HR','Senior Executive, HR','Leading HR-related activities with a focus on team coordination, member engagement, task management, organizational communication, and improving internal workflow.',TRUE
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE organization='UIU Computer Club' AND title='Head of HR');
INSERT INTO projects(slug,title,subtitle,short_description,category,status,github_url,is_published,display_order) VALUES
('citymind','CityMind','AI Urban Planning Decision Support System','A smart city planning platform designed to help users plan and analyze a selected urban area using interactive maps, spatial data, urban planning rules, and intelligent recommendations.','AI · Full Stack','Active','https://github.com/mrtortoise2029/mrtortoise2029-CityMind--A-Smart-City-Planner',TRUE,1),
('retrade','ReTrade','A Second-Hand Marketplace Auction Platform','A second-hand marketplace and auction platform designed for users to list, discover, and interact with pre-owned products.','Web · Academic','Completed','https://github.com/mrtortoise2029/ReTrade-A-Second-Hand-Marketplace-Auction-Platform',TRUE,2),
('the-last-defenders','The Last Defenders','Multiplayer Survival Strategy Game','A JavaFX-based multiplayer survival and strategy game with board-based gameplay, player health, money, dice mechanics, AI players, and multiplayer-oriented game flow.','Java · Academic','Completed','https://github.com/mrtortoise2029/The_Last_Defender_Monopoly',TRUE,3)
ON DUPLICATE KEY UPDATE title=VALUES(title),subtitle=VALUES(subtitle),short_description=VALUES(short_description),category=VALUES(category),status=VALUES(status),github_url=VALUES(github_url),is_published=VALUES(is_published),display_order=VALUES(display_order);
INSERT INTO project_skills(project_id,skill_id)
SELECT p.id,s.id FROM projects p JOIN skills s WHERE
  (p.slug='citymind' AND s.name IN ('React','Vite','Tailwind CSS','Node.js','Express.js','MySQL','Leaflet','React Leaflet','OpenStreetMap','Overpass API','Python','FastAPI','Recharts','Jest','Supertest','React Testing Library','Playwright')) OR
  (p.slug='retrade' AND s.name IN ('HTML','CSS','JavaScript','PHP','MySQL')) OR
  (p.slug='the-last-defenders' AND s.name IN ('Java'))
ON DUPLICATE KEY UPDATE skill_id=VALUES(skill_id);
INSERT IGNORE INTO task_categories(name) VALUES ('University'),('Project'),('Career'),('HR'),('Learning'),('Personal'),('Important');
INSERT INTO app_settings(setting_key,setting_value) VALUES
('public_email','fahizahmed18@gmail.com'),
('github_url','https://github.com/mrtortoise2029')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
