import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return {
          label: 'Verified',
          className: 'bg-success/10 text-success border-success/20',
          icon: <CheckCircle className="h-3 w-3" />,
        };
      case 'pending':
        return {
          label: 'Pending Review',
          className: 'bg-warning/10 text-warning border-warning/20',
          icon: <Clock className="h-3 w-3" />,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: <XCircle className="h-3 w-3" />,
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn("text-xs font-semibold border flex items-center gap-1", config.className, className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
