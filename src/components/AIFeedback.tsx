import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface AIFeedbackProps {
  fraudScore: number;
  contentQualityScore: number;
  flags: string[];
  recommendedAction: 'approve' | 'review' | 'reject';
  suggestions: string[];
}

export function AIFeedback({ 
  fraudScore, 
  contentQualityScore, 
  flags, 
  recommendedAction,
  suggestions 
}: AIFeedbackProps) {
  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'reject':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'review':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'reject':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getMessage = (action: string) => {
    switch (action) {
      case 'approve':
        return '✅ Submission looks great! Sent for admin review.';
      case 'review':
        return '⚠️ Some concerns detected. Admin will review carefully.';
      case 'reject':
        return '❌ Submission flagged. Please review guidelines and address issues below.';
      default:
        return 'Analysis complete';
    }
  };

  return (
    <div className="space-y-4">
      <Alert className={`${getBadgeStyle(recommendedAction)} border`}>
        <div className="flex items-start gap-3">
          {getIcon(recommendedAction)}
          <div className="flex-1">
            <AlertDescription className="font-medium">
              {getMessage(recommendedAction)}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-1">Quality Score</div>
          <div className="text-2xl font-bold">
            {(contentQualityScore * 100).toFixed(0)}%
          </div>
          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${contentQualityScore * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
          <div className="text-2xl font-bold">
            {(fraudScore * 100).toFixed(0)}%
          </div>
          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                fraudScore > 0.7 ? 'bg-red-500' : 
                fraudScore > 0.4 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${fraudScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="rounded-lg border p-4 bg-card">
          <h4 className="font-semibold mb-2">Detected Issues:</h4>
          <ul className="space-y-1">
            {flags.map((flag, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                {flag.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-lg border p-4 bg-blue-50">
          <h4 className="font-semibold mb-2">💡 Suggestions for Improvement:</h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}