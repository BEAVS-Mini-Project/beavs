
-- Insert Programs
INSERT INTO program (id, name, code) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Computer Science', 'CS'),
('550e8400-e29b-41d4-a716-446655440002', 'Information Technology', 'IT'),
('550e8400-e29b-41d4-a716-446655440003', 'Software Engineering', 'SE');

-- Insert Classes
INSERT INTO class (id, name, program_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Level 200 A', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'Level 200 B', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440003', 'Level 300 A', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440004', 'Level 400 A', '550e8400-e29b-41d4-a716-446655440003');

-- Insert Students
INSERT INTO student (id, student_number, index_number, full_name, class_id, program_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '2022020001', 'CS/22/001', 'John Doe', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '2022020002', 'CS/22/002', 'Jane Smith', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', '2022020003', 'CS/22/003', 'Michael Johnson', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440004', '2021030001', 'IT/21/001', 'Sarah Williams', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '2021030002', 'IT/21/002', 'David Brown', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440006', '2020040001', 'SE/20/001', 'Emily Davis', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440007', '2022020004', 'CS/22/004', 'Robert Wilson', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440008', '2022020005', 'CS/22/005', 'Lisa Garcia', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001');

-- Insert Courses
INSERT INTO course (id, name, code, program_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Data Structures and Algorithms', 'CS201', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', 'Database Systems', 'CS301', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440003', 'Network Administration', 'IT201', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440004', 'Software Engineering Principles', 'SE401', '550e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440005', 'Operating Systems', 'CS302', '550e8400-e29b-41d4-a716-446655440001');




-- Insert Colleges (without code column as it doesn't exist in the schema)
INSERT INTO college (id, name) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'College of Engineering'),
('cc0e8400-e29b-41d4-a716-446655440002', 'College of Science')
ON CONFLICT (id) DO NOTHING;

-- Insert Exam Rooms (without invigilator_id, with college_id)
INSERT INTO exam_room (id, name, capacity, college_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Room A101', 50, 'cc0e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', 'Room B201', 40, 'cc0e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440003', 'Room C301', 35, 'cc0e8400-e29b-41d4-a716-446655440002'),
('990e8400-e29b-41d4-a716-446655440004', 'Room D102', 45, 'cc0e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Insert Exam Sessions (today's date and some future dates)
INSERT INTO exam_session (id, course_id, exam_date, start_time, end_time, semester, academic_year, created_by) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '09:00:00', '12:00:00', 'First', '2024/2025', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0'),
('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, '14:00:00', '17:00:00', 'First', '2024/2025', '50ced161-80ea-403d-acfa-f1be703d1398'),
('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '13:00:00', 'First', '2024/2025', '1535c6b1-f004-471e-9759-2e2d01d6683f'),
('aa0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', CURRENT_DATE + INTERVAL '2 days', '08:00:00', '11:00:00', 'First', '2024/2025', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0'),
('aa0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', CURRENT_DATE, '15:30:00', '18:30:00', 'First', '2024/2025', '50ced161-80ea-403d-acfa-f1be703d1398');



-- Insert Course Room Allocations
INSERT INTO course_room_allocation (id, exam_session_id, exam_room_id, course_id, index_start, index_end, student_count) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 1, 50, 4),
('ee0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 1, 40, 3),
('ee0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 1, 35, 2),
('ee0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', 1, 50, 1),
('ee0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440005', 1, 45, 2)
ON CONFLICT (id) DO NOTHING;



-- Insert Invigilation Assignments
INSERT INTO invigilation_assignment (id, lecturer_id, exam_session_id, exam_room_id, assigned_by) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0'),
('dd0e8400-e29b-41d4-a716-446655440002', '50ced161-80ea-403d-acfa-f1be703d1398', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', '50ced161-80ea-403d-acfa-f1be703d1398'),
('dd0e8400-e29b-41d4-a716-446655440003', '1535c6b1-f004-471e-9759-2e2d01d6683f', 'aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', '1535c6b1-f004-471e-9759-2e2d01d6683f'),
('dd0e8400-e29b-41d4-a716-446655440004', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0', 'aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0'),
('dd0e8400-e29b-41d4-a716-446655440005', '50ced161-80ea-403d-acfa-f1be703d1398', 'aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440004', '50ced161-80ea-403d-acfa-f1be703d1398')
ON CONFLICT (id) DO NOTHING;

-- Insert Attendance Logs (using the new course_room_allocation structure)
INSERT INTO attendance_log (id, course_room_allocation_id, verified_by, method, note, student_number, fingerprint_matched, verified_at) VALUES
-- Today's Data Structures exam attendance
('ff0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0', 'biometric', 'Fingerprint verified', '2022020001', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('ff0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440001', '8bc74f72-3bc7-4d0e-a17a-f840c2bda1b0', 'manual', 'Manual override - fingerprint not working', '2022020002', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- Today's Database Systems exam attendance
('ff0e8400-e29b-41d4-a716-446655440003', 'ee0e8400-e29b-41d4-a716-446655440002', '50ced161-80ea-403d-acfa-f1be703d1398', 'biometric', 'Fingerprint verified', '2022020001', true, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('ff0e8400-e29b-41d4-a716-446655440004', 'ee0e8400-e29b-41d4-a716-446655440002', '50ced161-80ea-403d-acfa-f1be703d1398', 'biometric', 'Fingerprint verified', '2022020002', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
