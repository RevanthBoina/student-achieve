-- Create the record-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-proofs', 'record-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for record-proofs bucket
CREATE POLICY "Anyone can view record proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-proofs');

CREATE POLICY "Authenticated users can upload record proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'record-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own record proofs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'record-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own record proofs"
ON storage.objects FOR DELETE
USING (bucket_id = 'record-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add student_name and school_name columns to records table
ALTER TABLE public.records 
ADD COLUMN IF NOT EXISTS student_name text,
ADD COLUMN IF NOT EXISTS school_name text;