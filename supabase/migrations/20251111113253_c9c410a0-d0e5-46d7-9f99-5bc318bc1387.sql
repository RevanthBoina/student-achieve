-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_record_id ON reactions(record_id);
CREATE INDEX IF NOT EXISTS idx_comments_record_id ON comments(record_id);
CREATE INDEX IF NOT EXISTS idx_records_status_created ON records(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_category_status ON records(category_id, status);

-- Add engagement score column to records for trending algorithm
ALTER TABLE records ADD COLUMN IF NOT EXISTS engagement_score DECIMAL DEFAULT 0;

-- Function to calculate engagement score (reactions + comments + breaks weighted)
CREATE OR REPLACE FUNCTION calculate_engagement_score(record_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL := 0;
  reaction_count INTEGER := 0;
  comment_count INTEGER := 0;
  break_count INTEGER := 0;
  age_hours DECIMAL := 0;
BEGIN
  -- Count reactions
  SELECT COUNT(*) INTO reaction_count FROM reactions WHERE reactions.record_id = calculate_engagement_score.record_id;
  
  -- Count comments
  SELECT COUNT(*) INTO comment_count FROM comments WHERE comments.record_id = calculate_engagement_score.record_id;
  
  -- Count break attempts
  SELECT COUNT(*) INTO break_count FROM record_breaks WHERE record_breaks.record_id = calculate_engagement_score.record_id;
  
  -- Calculate age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 INTO age_hours 
  FROM records WHERE id = calculate_engagement_score.record_id;
  
  -- Weighted scoring: reactions=1, comments=2, breaks=3, with time decay
  score := (reaction_count * 1.0 + comment_count * 2.0 + break_count * 3.0) / (age_hours + 2);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement score on reaction/comment changes
CREATE OR REPLACE FUNCTION update_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE records 
  SET engagement_score = calculate_engagement_score(NEW.record_id)
  WHERE id = NEW.record_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_engagement_on_reaction ON reactions;
DROP TRIGGER IF EXISTS update_engagement_on_comment ON comments;
DROP TRIGGER IF EXISTS update_engagement_on_break ON record_breaks;

-- Create triggers
CREATE TRIGGER update_engagement_on_reaction
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

CREATE TRIGGER update_engagement_on_comment
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

CREATE TRIGGER update_engagement_on_break
AFTER INSERT OR DELETE ON record_breaks
FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

-- Enable realtime for reactions and comments
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;