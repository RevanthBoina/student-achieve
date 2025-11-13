import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, googleDriveLink, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize analysis results
    const flags: string[] = [];
    let fraudScore = 0.0;
    let contentQualityScore = 1.0;

    // === QUALITY CHECKS ===
    if (description.length < 100) {
      flags.push('SHORT_DESCRIPTION');
      contentQualityScore -= 0.2;
    }
    
    if (title.length < 10) {
      flags.push('SHORT_TITLE');
      contentQualityScore -= 0.1;
    }

    if (!googleDriveLink || googleDriveLink.trim().length === 0) {
      flags.push('MISSING_EVIDENCE');
      fraudScore += 0.3;
      contentQualityScore -= 0.3;
    }

    // Validate Google Drive link format
    if (googleDriveLink && !googleDriveLink.includes('drive.google.com')) {
      flags.push('INVALID_DRIVE_LINK');
      fraudScore += 0.2;
    }

    // === FRAUD PATTERN DETECTION ===
    // Check for duplicate submissions (same user, similar title, last 7 days)
    const { data: recentSubmissions } = await supabase
      .from('records')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (recentSubmissions && recentSubmissions.length > 0) {
      // Check for similar titles
      const similarTitle = recentSubmissions.find(r => {
        const similarity = calculateSimilarity(title.toLowerCase(), r.title.toLowerCase());
        return similarity > 0.8;
      });

      if (similarTitle) {
        flags.push('DUPLICATE_SUBMISSION');
        fraudScore += 0.3;
      }

      // Check submission frequency (more than 3 in 7 days is suspicious)
      if (recentSubmissions.length >= 3) {
        flags.push('HIGH_SUBMISSION_FREQUENCY');
        fraudScore += 0.2;
      }
    }

    // Get user's rejection history
    const { data: userRecords } = await supabase
      .from('records')
      .select('status')
      .eq('user_id', userId);

    if (userRecords && userRecords.length > 2) {
      const rejectedCount = userRecords.filter(r => r.status === 'rejected').length;
      const rejectionRate = rejectedCount / userRecords.length;
      
      if (rejectionRate > 0.7) {
        flags.push('HIGH_REJECTION_HISTORY');
        fraudScore += 0.2;
      }
    }

    // === AI CONTENT MODERATION ===
    const textToAnalyze = `Title: ${title}\nDescription: ${description}`;
    
    console.log('Analyzing content with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a content moderator for a student records platform. Analyze submissions for inappropriate content, spam, or quality issues. Respond with a JSON object containing: { "hasInappropriateContent": boolean, "hasSpam": boolean, "contentQuality": "high"|"medium"|"low", "concerns": string[] }'
          },
          {
            role: 'user',
            content: textToAnalyze
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI moderation failed:', aiResponse.status);
    } else {
      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0]?.message?.content || '';
      
      try {
        // Extract JSON from response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiAnalysis = JSON.parse(jsonMatch[0]);
          
          if (aiAnalysis.hasInappropriateContent) {
            flags.push('INAPPROPRIATE_CONTENT');
            fraudScore += 0.5;
          }
          
          if (aiAnalysis.hasSpam) {
            flags.push('SPAM_DETECTED');
            fraudScore += 0.4;
          }
          
          if (aiAnalysis.contentQuality === 'low') {
            flags.push('LOW_QUALITY_CONTENT');
            contentQualityScore -= 0.2;
          }
          
          console.log('AI Analysis:', aiAnalysis);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    }

    // Normalize scores
    fraudScore = Math.min(Math.max(fraudScore, 0), 1);
    contentQualityScore = Math.min(Math.max(contentQualityScore, 0), 1);

    // Determine recommended action
    let recommendedAction = 'approve';
    if (fraudScore > 0.7 || flags.includes('INAPPROPRIATE_CONTENT')) {
      recommendedAction = 'reject';
    } else if (fraudScore > 0.4 || flags.length >= 3) {
      recommendedAction = 'review';
    }

    // Generate suggestions
    const suggestions = generateSuggestions(flags);

    const result = {
      fraudScore: parseFloat(fraudScore.toFixed(2)),
      contentQualityScore: parseFloat(contentQualityScore.toFixed(2)),
      flags,
      recommendedAction,
      suggestions,
      details: {
        textLength: textToAnalyze.length,
        flagCount: flags.length,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matches = 0;
  for (const word of words1) {
    if (words2.includes(word)) {
      matches++;
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

function generateSuggestions(flags: string[]): string[] {
  const suggestions: string[] = [];
  
  if (flags.includes('SHORT_DESCRIPTION')) {
    suggestions.push('Add more details about your achievement (minimum 100 characters recommended)');
  }
  
  if (flags.includes('SHORT_TITLE')) {
    suggestions.push('Provide a more descriptive title (minimum 10 characters)');
  }
  
  if (flags.includes('MISSING_EVIDENCE') || flags.includes('INVALID_DRIVE_LINK')) {
    suggestions.push('Upload video/photo proof to Google Drive and ensure the link is publicly accessible');
  }
  
  if (flags.includes('DUPLICATE_SUBMISSION')) {
    suggestions.push('This appears similar to a recent submission. Please ensure you are submitting a unique record');
  }
  
  if (flags.includes('INAPPROPRIATE_CONTENT')) {
    suggestions.push('Content may violate community guidelines. Please review and revise');
  }
  
  if (flags.includes('LOW_QUALITY_CONTENT')) {
    suggestions.push('Improve content quality with specific details, proper grammar, and clear descriptions');
  }
  
  return suggestions;
}