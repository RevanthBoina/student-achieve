-- Add school column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school TEXT;