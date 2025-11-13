-- AI Moderation Results Table
CREATE TABLE IF NOT EXISTS public.ai_moderation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES public.records(id) ON DELETE CASCADE,
  fraud_score DECIMAL(3,2) CHECK (fraud_score >= 0 AND fraud_score <= 1),
  content_quality_score DECIMAL(3,2) CHECK (content_quality_score >= 0 AND content_quality_score <= 1),
  flags TEXT[],
  recommended_action TEXT CHECK (recommended_action IN ('approve', 'review', 'reject')),
  analysis_details JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin queries
CREATE INDEX idx_ai_moderation_fraud_score ON public.ai_moderation_results(fraud_score DESC);
CREATE INDEX idx_ai_moderation_recommended_action ON public.ai_moderation_results(recommended_action);
CREATE INDEX idx_ai_moderation_record_id ON public.ai_moderation_results(record_id);

-- Add AI fields to records table
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS ai_fraud_score DECIMAL(3,2);
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS ai_flags TEXT[];
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS ai_reviewed BOOLEAN DEFAULT FALSE;

-- RLS Policies for ai_moderation_results
ALTER TABLE public.ai_moderation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI results viewable by admins and collaborators"
  ON public.ai_moderation_results
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'collaborator'::app_role)
  );

CREATE POLICY "AI results viewable by record owner"
  ON public.ai_moderation_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.records
      WHERE records.id = ai_moderation_results.record_id
      AND records.user_id = auth.uid()
    )
  );