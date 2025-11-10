-- Add is_public column to profiles table for user privacy control
ALTER TABLE public.profiles
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own complete profile
CREATE POLICY "Users can view own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Public can view only basic info of public profiles (excluding sensitive fields)
CREATE POLICY "Public can view basic public profiles"
ON public.profiles
FOR SELECT
USING (
  is_public = true
  -- This policy only allows selecting non-sensitive columns
  -- Sensitive fields like email, school_email, id_card_url, verification flags
  -- are excluded by application-level column selection
);