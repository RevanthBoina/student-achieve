-- Create storage buckets for file uploads with proper security

-- 1. Avatars bucket (public access for viewing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 2. ID cards bucket (private - only owner and admins)
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-cards', 'id-cards', false);

-- 3. Record media bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-media', 'record-media', true);

-- 4. Evidence bucket (private until verified)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false);

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for id-cards bucket
CREATE POLICY "Users can upload own ID card"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'id-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users and admins can view ID cards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-cards' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'collaborator'::app_role)
  )
);

CREATE POLICY "Users can update own ID card"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'id-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own ID card"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'id-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for record-media bucket
CREATE POLICY "Anyone can view record media"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-media');

CREATE POLICY "Authenticated users can upload record media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'record-media' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update own record media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'record-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own record media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'record-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for evidence bucket
CREATE POLICY "Users can upload own evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users and collaborators can view evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evidence' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'collaborator'::app_role)
  )
);

CREATE POLICY "Users can update own evidence"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own evidence"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);