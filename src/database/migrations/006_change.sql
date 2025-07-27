-- Update the database schema to support distributed course allocations

-- Drop the existing course_hall_allocation table as it doesn't support the new requirements
DROP TABLE IF EXISTS course_hall_allocation CASCADE;

-- Create a new table to track course allocations with index ranges
CREATE TABLE course_room_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID REFERENCES exam_session(id) ON DELETE CASCADE,
  exam_room_id UUID REFERENCES exam_room(id) ON DELETE CASCADE,
  course_id UUID REFERENCES course(id) ON DELETE CASCADE,
  index_start INTEGER NOT NULL,
  index_end INTEGER NOT NULL,
  student_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  CHECK (index_end >= index_start),
  CHECK (student_count > 0),
  CHECK (student_count = (index_end - index_start + 1))
);

-- Enable RLS on new table
ALTER TABLE course_room_allocation ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_room_allocation
CREATE POLICY "Admins can manage course room allocations" ON course_room_allocation
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Invigilators can view course room allocations" ON course_room_allocation
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

-- Update capacity validation function for the new structure
CREATE OR REPLACE FUNCTION validate_room_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if total allocated students exceeds room capacity for the same exam time
  IF (
    SELECT SUM(cra.student_count) 
    FROM course_room_allocation cra
    JOIN exam_session es ON cra.exam_session_id = es.id
    WHERE cra.exam_room_id = NEW.exam_room_id 
    AND es.exam_date = (SELECT exam_date FROM exam_session WHERE id = NEW.exam_session_id)
    AND es.start_time = (SELECT start_time FROM exam_session WHERE id = NEW.exam_session_id)
    AND es.end_time = (SELECT end_time FROM exam_session WHERE id = NEW.exam_session_id)
  ) > (SELECT capacity FROM exam_room WHERE id = NEW.exam_room_id) THEN
    RAISE EXCEPTION 'Total student allocation exceeds room capacity for this exam time slot';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for capacity validation
CREATE TRIGGER check_room_capacity
  BEFORE INSERT OR UPDATE ON course_room_allocation
  FOR EACH ROW EXECUTE FUNCTION validate_room_capacity();

-- Insert sample data based on your examples
-- First, let's create some courses if they don't exist
INSERT INTO course (name, code, program_id, level) VALUES
('Biochemistry I', 'BCH 151', (SELECT id FROM program WHERE code = 'CS' LIMIT 1), 100),
('Optometry I', 'OPT 101', (SELECT id FROM program WHERE code = 'IT' LIMIT 1), 100),
('Computer Science Mathematics', 'CSM 103', (SELECT id FROM program WHERE code = 'CS' LIMIT 1), 100),
('Computer Science Mathematics II', 'CSM 203', (SELECT id FROM program WHERE code = 'CS' LIMIT 1), 200),
('Statistics I', 'STA 101', (SELECT id FROM program WHERE code = 'IT' LIMIT 1), 100),
('Biochemistry II', 'BCH 255', (SELECT id FROM program WHERE code = 'CS' LIMIT 1), 200)
ON CONFLICT (code) DO NOTHING;

-- Create exam rooms if they don't exist
INSERT INTO exam_room (name, capacity, college_id) VALUES
('SF1', 100, (SELECT id FROM college WHERE name = 'College of Science and Technology')),
('FF24', 54, (SELECT id FROM college WHERE name = 'College of Science and Technology')),
('TF7', 40, (SELECT id FROM college WHERE name = 'College of Science and Technology')),
('TF3', 45, (SELECT id FROM college WHERE name = 'College of Science and Technology'))
ON CONFLICT DO NOTHING;

-- Create exam sessions for today
INSERT INTO exam_session (course_id, exam_date, start_time, end_time, semester, academic_year) 
SELECT 
  c.id,
  CURRENT_DATE,
  '09:00:00',
  '12:00:00',
  'First Semester',
  '2024/2025'
FROM course c 
WHERE c.code IN ('BCH 151', 'OPT 101', 'CSM 103', 'CSM 203', 'STA 101', 'BCH 255')
ON CONFLICT DO NOTHING;

-- Insert course room allocations based on your examples
-- SF1: BCH 151 (index 1-50) and OPT 101 (index 1-50)
INSERT INTO course_room_allocation (exam_session_id, exam_room_id, course_id, index_start, index_end, student_count)
SELECT 
  es.id,
  er.id,
  c.id,
  1,
  50,
  50
FROM exam_session es
JOIN course c ON es.course_id = c.id
JOIN exam_room er ON er.name = 'SF1'
WHERE c.code IN ('BCH 151', 'OPT 101');

-- FF24: CSM 103 (index 1-24) and CSM 203 (index 1-30)
INSERT INTO course_room_allocation (exam_session_id, exam_room_id, course_id, index_start, index_end, student_count)
SELECT 
  es.id,
  er.id,
  c.id,
  CASE WHEN c.code = 'CSM 103' THEN 1 ELSE 1 END,
  CASE WHEN c.code = 'CSM 103' THEN 24 ELSE 30 END,
  CASE WHEN c.code = 'CSM 103' THEN 24 ELSE 30 END
FROM exam_session es
JOIN course c ON es.course_id = c.id
JOIN exam_room er ON er.name = 'FF24'
WHERE c.code IN ('CSM 103', 'CSM 203');

-- TF7: STA 101 (index 1-20) and BCH 255 (index 1-20)
INSERT INTO course_room_allocation (exam_session_id, exam_room_id, course_id, index_start, index_end, student_count)
SELECT 
  es.id,
  er.id,
  c.id,
  1,
  20,
  20
FROM exam_session es
JOIN course c ON es.course_id = c.id
JOIN exam_room er ON er.name = 'TF7'
WHERE c.code IN ('STA 101', 'BCH 255');

-- TF3: STA 101 (index 21-40) and CSM 103 (index 25-50)
INSERT INTO course_room_allocation (exam_session_id, exam_room_id, course_id, index_start, index_end, student_count)
SELECT 
  es.id,
  er.id,
  c.id,
  CASE WHEN c.code = 'STA 101' THEN 21 ELSE 25 END,
  CASE WHEN c.code = 'STA 101' THEN 40 ELSE 50 END,
  CASE WHEN c.code = 'STA 101' THEN 20 ELSE 26 END
FROM exam_session es
JOIN course c ON es.course_id = c.id
JOIN exam_room er ON er.name = 'TF3'
WHERE c.code IN ('STA 101', 'CSM 103');

-- Clear existing invigilation assignments
DELETE FROM invigilation_assignment;

-- Insert invigilation assignments based on your examples
-- SF1: inv001 and inv002
INSERT INTO invigilation_assignment (lecturer_id, exam_session_id, exam_room_id, assigned_by)
SELECT 
  l.id,
  es.id,
  er.id,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM lecturer l
CROSS JOIN exam_session es
JOIN course c ON es.course_id = c.id
JOIN exam_room er ON er.name = 'SF1'
WHERE c.code IN ('BCH 151', 'OPT 101')
AND l.email LIKE '%@%'
LIMIT 4;