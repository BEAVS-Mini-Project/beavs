-- Migration: Update invigilation_assignment to use profile_id from profiles instead of lecturer_id from lecturer

-- 1. Rename lecturer_id to profile_id
ALTER TABLE invigilation_assignment RENAME COLUMN lecturer_id TO profile_id;

-- 2. Drop old foreign key constraint (if exists)
ALTER TABLE invigilation_assignment DROP CONSTRAINT IF EXISTS invigilation_assignment_lecturer_id_fkey;

-- 3. Add new foreign key constraint to profiles(id)
ALTER TABLE invigilation_assignment ADD CONSTRAINT invigilation_assignment_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Update unique constraint if it referenced lecturer_id
ALTER TABLE invigilation_assignment DROP CONSTRAINT IF EXISTS invigilation_assignment_lecturer_id_exam_session_id_key;
ALTER TABLE invigilation_assignment ADD CONSTRAINT invigilation_assignment_profile_id_exam_session_id_key UNIQUE (profile_id, exam_session_id); 