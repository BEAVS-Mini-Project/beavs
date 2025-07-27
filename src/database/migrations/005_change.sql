I'll implement the enhanced academic hierarchy plan step by step. Let's start with the database migration to add all the new tables and extend existing ones.

-- Add new academic hierarchy tables and extend existing ones

-- College
CREATE TABLE college (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Faculty
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  college_id UUID REFERENCES college(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Department
CREATE TABLE department (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Lecturer (linked to profiles table)
CREATE TABLE lecturer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES department(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Extend program table with department
ALTER TABLE program ADD COLUMN department_id UUID REFERENCES department(id) ON DELETE SET NULL;

-- Extend course table with level
ALTER TABLE course ADD COLUMN level INTEGER;

-- Extend exam_allocation with manual verification fields
ALTER TABLE exam_allocation 
ADD COLUMN was_manually_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verified_student_number TEXT,
ADD COLUMN manual_verification_note TEXT;

-- Invigilation Assignment (links lecturer to session + room)
CREATE TABLE invigilation_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID REFERENCES lecturer(id) ON DELETE CASCADE,
  exam_session_id UUID REFERENCES exam_session(id) ON DELETE CASCADE,
  exam_room_id UUID REFERENCES exam_room(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (lecturer_id, exam_session_id)
);

-- Attendance Log (immutable audit trail)
CREATE TABLE attendance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_allocation_id UUID REFERENCES exam_allocation(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES lecturer(id),
  verified_at TIMESTAMP DEFAULT now(),
  method TEXT CHECK (method IN ('biometric', 'manual')),
  note TEXT,
  student_number TEXT,
  fingerprint_matched BOOLEAN
);

-- Enable RLS on new tables
ALTER TABLE college ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE department ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer ENABLE ROW LEVEL SECURITY;
ALTER TABLE invigilation_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

-- College policies
CREATE POLICY "Admins can manage colleges" ON college
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view colleges" ON college
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

-- Faculty policies
CREATE POLICY "Admins can manage faculties" ON faculty
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view faculties" ON faculty
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

-- Department policies
CREATE POLICY "Admins can manage departments" ON department
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view departments" ON department
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

-- Lecturer policies
CREATE POLICY "Admins can manage lecturers" ON lecturer
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Lecturers can view themselves" ON lecturer
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can view lecturers" ON lecturer
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

-- Invigilation assignment policies
CREATE POLICY "Admins can manage invigilation assignments" ON invigilation_assignment
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Lecturers can view their assignments" ON invigilation_assignment
FOR SELECT USING (
  EXISTS (SELECT 1 FROM lecturer WHERE lecturer.id = invigilation_assignment.lecturer_id AND lecturer.profile_id = auth.uid())
);

-- Attendance log policies
CREATE POLICY "Admins can manage attendance logs" ON attendance_log
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Lecturers can view attendance logs" ON attendance_log
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

CREATE POLICY "Lecturers can insert attendance logs" ON attendance_log
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lecturer WHERE lecturer.id = attendance_log.verified_by AND lecturer.profile_id = auth.uid())
);

-- Insert some initial data for testing
INSERT INTO college (name) VALUES 
('College of Science and Technology'),
('College of Business'),
('College of Arts and Humanities');

INSERT INTO faculty (name, college_id) VALUES 
('Faculty of Computer Science', (SELECT id FROM college WHERE name = 'College of Science and Technology')),
('Faculty of Engineering', (SELECT id FROM college WHERE name = 'College of Science and Technology')),
('Faculty of Business Administration', (SELECT id FROM college WHERE name = 'College of Business'));

INSERT INTO department (name, faculty_id) VALUES 
('Computer Science Department', (SELECT id FROM faculty WHERE name = 'Faculty of Computer Science')),
('Information Technology Department', (SELECT id FROM faculty WHERE name = 'Faculty of Computer Science')),
('Software Engineering Department', (SELECT id FROM faculty WHERE name = 'Faculty of Computer Science'));

-- Update existing programs to link to departments
UPDATE program SET department_id = (
  SELECT id FROM department WHERE name = 'Computer Science Department'
) WHERE code = 'CS';

UPDATE program SET department_id = (
  SELECT id FROM department WHERE name = 'Information Technology Department'
) WHERE code = 'IT';

UPDATE program SET department_id = (
  SELECT id FROM department WHERE name = 'Software Engineering Department'
) WHERE code = 'SE';

-- Update courses with levels
UPDATE course SET level = 200 WHERE code IN ('CS201', 'IT205');
UPDATE course SET level = 300 WHERE code IN ('CS301', 'IT301', 'SE305');