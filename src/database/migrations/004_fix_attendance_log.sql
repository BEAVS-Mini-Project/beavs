-- Fix attendance_log table to use course_room_allocation instead of exam_allocation
-- Drop the old attendance_log table
DROP TABLE IF EXISTS attendance_log;

-- Recreate attendance_log table with correct foreign key
CREATE TABLE attendance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_room_allocation_id UUID REFERENCES course_room_allocation(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP DEFAULT now(),
  method TEXT CHECK (method IN ('biometric', 'manual')),
  note TEXT,
  student_number TEXT,
  fingerprint_matched BOOLEAN
);

-- Enable RLS on attendance_log
ALTER TABLE attendance_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_log
CREATE POLICY "Admins can manage attendance logs" ON attendance_log
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Invigilators can view attendance logs" ON attendance_log
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
);

CREATE POLICY "Invigilators can insert attendance logs" ON attendance_log
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'invigilator'))
); 