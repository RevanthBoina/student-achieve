-- Drop triggers and functions, then recreate with proper search_path
DROP TRIGGER IF EXISTS update_engagement_on_reaction ON reactions;
DROP TRIGGER IF EXISTS update_engagement_on_comment ON comments;
DROP TRIGGER IF EXISTS update_engagement_on_break ON record_breaks;
DROP FUNCTION IF EXISTS update_engagement_score() CASCADE;
DROP FUNCTION IF EXISTS calculate_engagement_score(UUID) CASCADE;

-- Recreate with proper search_path
CREATE FUNCTION calculate_engagement_score(record_id UUID)
RETURNS DECIMAL 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score DECIMAL := 0;
  reaction_count INTEGER := 0;
  comment_count INTEGER := 0;
  break_count INTEGER := 0;
  age_hours DECIMAL := 0;
BEGIN
  SELECT COUNT(*) INTO reaction_count FROM reactions WHERE reactions.record_id = calculate_engagement_score.record_id;
  SELECT COUNT(*) INTO comment_count FROM comments WHERE comments.record_id = calculate_engagement_score.record_id;
  SELECT COUNT(*) INTO break_count FROM record_breaks WHERE record_breaks.record_id = calculate_engagement_score.record_id;
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 INTO age_hours 
  FROM records WHERE id = calculate_engagement_score.record_id;
  
  score := (reaction_count * 1.0 + comment_count * 2.0 + break_count * 3.0) / (age_hours + 2);
  RETURN score;
END;
$$;

CREATE FUNCTION update_engagement_score()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE records 
  SET engagement_score = calculate_engagement_score(NEW.record_id)
  WHERE id = NEW.record_id;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_engagement_on_reaction
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

CREATE TRIGGER update_engagement_on_comment
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

CREATE TRIGGER update_engagement_on_break
AFTER INSERT OR DELETE ON record_breaks
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();