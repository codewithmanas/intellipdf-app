-- Add doc_id column
ALTER TABLE public.files
ADD COLUMN doc_id UUID;