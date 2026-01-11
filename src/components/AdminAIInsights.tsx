import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AIInsight {
  id: string;
  record_id: string;
  fraud_score: number;
  content_quality_score: number;
  flags: string[];
  recommended_action: string;
  analyzed_at: string;
  record: {
    title: string;
    status: string;
  };
}

export function AdminAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      const { data, error } = await (supabase
        .from("ai_moderation_results" as any)
        .select(
          `
          id,
          record_id,
          fraud_score,
          content_quality_score,
          flags,
          recommended_action,
          analyzed_at,
          records!inner(title, status)
        `,
        )
        .eq("records.status", "pending")
        .order("fraud_score", { ascending: false })
        .limit(10) as any);

      if (error) throw error;

      const formatted: AIInsight[] = (data || []).map((item: any) => ({
        id: item.id,
        record_id: item.record_id,
        fraud_score: item.fraud_score,
        content_quality_score: item.content_quality_score,
        flags: item.flags || [],
        recommended_action: item.recommended_action,
        analyzed_at: item.analyzed_at,
        record: item.records ? { title: item.records.title, status: item.records.status } : { title: "", status: "" },
      }));

      setInsights(formatted);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 0.7) return "text-red-600";
    if (score > 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskIcon = (score: number) => {
    if (score > 0.7) return <XCircle className="h-5 w-5 text-red-600" />;
    if (score > 0.4)
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  if (loading) {
    return <div className="text-center py-8">Loading AI insights...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 AI Moderation Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending submissions with AI analysis
            </p>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-1 flex-1">
                    {insight.record.title}
                  </h3>
                  {getRiskIcon(insight.fraud_score)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Fraud Risk
                    </div>
                    <div
                      className={`text-lg font-bold ${getRiskColor(insight.fraud_score)}`}
                    >
                      {(insight.fraud_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Quality</div>
                    <div className="text-lg font-bold">
                      {(insight.content_quality_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {insight.flags && insight.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {insight.flags.map((flag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {flag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Badge
                    variant={
                      insight.recommended_action === "reject"
                        ? "destructive"
                        : insight.recommended_action === "review"
                          ? "default"
                          : "default"
                    }
                  >
                    AI: {insight.recommended_action.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.analyzed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
