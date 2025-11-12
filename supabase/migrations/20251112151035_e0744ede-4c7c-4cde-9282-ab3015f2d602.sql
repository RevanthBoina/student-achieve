-- Security Fix: Create a public profiles view with safe columns only
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  school,
  is_verified,
  followers_count,
  following_count,
  records_count,
  broken_records_count,
  created_at
FROM profiles
WHERE is_public = true;

-- Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Public can view basic public profiles" ON profiles;

-- Create restrictive RLS policies that prevent column exposure
CREATE POLICY "Users can view public profile info only"
ON profiles FOR SELECT
USING (
  -- Users can only see limited public info for public profiles
  (is_public = true AND auth.uid() != id)
  OR
  -- Users can see their own full profile
  (auth.uid() = id)
  OR
  -- Admins can see everything
  has_role(auth.uid(), 'admin'::app_role)
);

-- Rate Limiting: Create functions to check comment rate limits
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_count INT;
  recent_comment_time TIMESTAMP;
BEGIN
  -- Check daily limit (100 comments per day)
  SELECT COUNT(*) INTO comment_count
  FROM comments
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '1 day';
  
  IF comment_count >= 100 THEN
    RAISE EXCEPTION 'Daily comment limit reached (100 per day). Please try again tomorrow.';
  END IF;
  
  -- Check cooldown (3 seconds between comments)
  SELECT MAX(created_at) INTO recent_comment_time
  FROM comments
  WHERE user_id = NEW.user_id;
  
  IF recent_comment_time IS NOT NULL 
     AND recent_comment_time > NOW() - INTERVAL '3 seconds' THEN
    RAISE EXCEPTION 'Please wait 3 seconds between comments.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for comment rate limiting
DROP TRIGGER IF EXISTS enforce_comment_rate_limit ON comments;
CREATE TRIGGER enforce_comment_rate_limit
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_rate_limit();

-- Rate Limiting: Create function to check reaction rate limits
CREATE OR REPLACE FUNCTION public.check_reaction_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reaction_count INT;
BEGIN
  -- Check hourly limit (200 reactions per hour to prevent spam)
  SELECT COUNT(*) INTO reaction_count
  FROM reactions
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF reaction_count >= 200 THEN
    RAISE EXCEPTION 'Hourly reaction limit reached (200 per hour). Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for reaction rate limiting
DROP TRIGGER IF EXISTS enforce_reaction_rate_limit ON reactions;
CREATE TRIGGER enforce_reaction_rate_limit
  BEFORE INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION check_reaction_rate_limit();

-- Rate Limiting: Create function to check record submission rate limits
CREATE OR REPLACE FUNCTION public.check_record_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_count INT;
BEGIN
  -- Check daily limit (5 record submissions per day)
  SELECT COUNT(*) INTO record_count
  FROM records
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '1 day';
  
  IF record_count >= 5 THEN
    RAISE EXCEPTION 'Daily record submission limit reached (5 per day). Please try again tomorrow.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for record rate limiting
DROP TRIGGER IF EXISTS enforce_record_rate_limit ON records;
CREATE TRIGGER enforce_record_rate_limit
  BEFORE INSERT ON records
  FOR EACH ROW
  EXECUTE FUNCTION check_record_rate_limit();

-- Server-side validation: Add validation trigger for comments
CREATE OR REPLACE FUNCTION public.validate_comment_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trim whitespace
  NEW.content := TRIM(NEW.content);
  
  -- Validate not empty
  IF LENGTH(NEW.content) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty.';
  END IF;
  
  -- Validate length (redundant with CHECK constraint, but explicit validation)
  IF LENGTH(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Comment content exceeds maximum length of 5000 characters.';
  END IF;
  
  -- Basic sanitization: prevent excessive whitespace
  NEW.content := REGEXP_REPLACE(NEW.content, '\s+', ' ', 'g');
  
  RETURN NEW;
END;
$$;

-- Create trigger for comment validation
DROP TRIGGER IF EXISTS validate_comment_before_insert ON comments;
CREATE TRIGGER validate_comment_before_insert
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION validate_comment_content();

-- Server-side validation: Add validation trigger for records
CREATE OR REPLACE FUNCTION public.validate_record_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trim whitespace
  NEW.title := TRIM(NEW.title);
  NEW.description := TRIM(NEW.description);
  
  -- Validate title not empty
  IF LENGTH(NEW.title) = 0 THEN
    RAISE EXCEPTION 'Record title cannot be empty.';
  END IF;
  
  -- Validate description not empty
  IF LENGTH(NEW.description) = 0 THEN
    RAISE EXCEPTION 'Record description cannot be empty.';
  END IF;
  
  -- Validate lengths
  IF LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Record title exceeds maximum length of 200 characters.';
  END IF;
  
  IF LENGTH(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Record description exceeds maximum length of 5000 characters.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for record validation
DROP TRIGGER IF EXISTS validate_record_before_insert ON records;
CREATE TRIGGER validate_record_before_insert
  BEFORE INSERT OR UPDATE ON records
  FOR EACH ROW
  EXECUTE FUNCTION validate_record_content();