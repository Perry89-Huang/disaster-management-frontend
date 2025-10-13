-- 移除 assignments 表的唯一性約束
-- 這將允許同一個志工對同一個需求創建多個 assignment

-- 如果約束存在，則移除它
ALTER TABLE assignments 
DROP CONSTRAINT IF EXISTS assignments_volunteer_id_request_id_key;

-- 驗證約束已移除
-- 您可以使用以下查詢檢查約束是否還存在：
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'assignments' 
-- AND constraint_type = 'UNIQUE';
