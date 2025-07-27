
-- Add answer_sheet_number column to exam_allocation table (nullable)
ALTER TABLE public.exam_allocation 
ADD COLUMN answer_sheet_number text NULL;

-- Add answer_sheet_number column to attendance_log table as well for audit trail (nullable)
ALTER TABLE public.attendance_log 
ADD COLUMN answer_sheet_number text NULL;
