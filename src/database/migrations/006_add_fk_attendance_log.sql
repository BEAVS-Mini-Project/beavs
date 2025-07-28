-- Migration: Add foreign key from attendance_log.course_room_allocation_id to course_room_allocation.id
 
ALTER TABLE attendance_log
ADD CONSTRAINT attendance_log_course_room_allocation_id_fkey
FOREIGN KEY (course_room_allocation_id)
REFERENCES course_room_allocation(id)
ON DELETE CASCADE; 