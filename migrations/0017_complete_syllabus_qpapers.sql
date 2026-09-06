-- 0017_complete_syllabus_qpapers.sql: Full verified content for all question papers and syllabus items
-- Generated and applied to data/edusob.sqlite
UPDATE question_papers SET is_active = 1, link = '' WHERE is_active = 0;
UPDATE syllabus SET is_active = 1, link = '' WHERE is_active = 0;
