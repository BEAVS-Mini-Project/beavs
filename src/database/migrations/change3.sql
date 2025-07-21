
-- Add college_id column to exam_room table
ALTER TABLE public.exam_room 
ADD COLUMN college_id UUID REFERENCES public.college(id);

-- Set a default college for existing rooms (you may want to update this with actual college IDs)
UPDATE public.exam_room 
SET college_id = (SELECT id FROM public.college LIMIT 1)
WHERE college_id IS NULL;

-- Make college_id required for new rooms
ALTER TABLE public.exam_room 
ALTER COLUMN college_id SET NOT NULL;
