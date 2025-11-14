import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BadgeCheck, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { ReactionButtons } from './ReactionButtons';
import { CommentThread } from './CommentThread';
import { ShareDialog } from './ShareDialog';

interface RecordCardProps {
  record: {
    id: string;
    title: string;
    description: string;
    media_url?: string;
    created_at: string;
    category: { name: string; id: string };
    profile: {
      id: string;
      full_name: string;
      avatar_url?: string;
      is_verified: boolean;
    };
    reactions_count: number;
    comments_count: number;
    broken_by?: {
      id: string;
      full_name: string;
      broken_at: string;
    };
  };
}

export const RecordCard = ({ record }: RecordCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = record.description.length > 200 
    ? record.description.substring(0, 200) + '...' 
    : record.description;

  return (
    <Card className="group overflow-hidden shadow-card hover-lift border border-border/50">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
          <AvatarImage src={record.profile.avatar_url} alt={record.profile.full_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {record.profile.full_name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{record.profile.full_name}</span>
            {record.profile.is_verified && (
              <BadgeCheck className="h-4 w-4 text-gold" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Posted {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
          </p>
        </div>
        <Badge className="bg-gold/10 text-gold-foreground border border-gold/20 text-xs uppercase font-semibold">
          {record.category.name}
        </Badge>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h3 className="text-xl font-bold font-poppins mb-3 group-hover:text-primary transition-colors">
          {record.title}
        </h3>
        <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
          {isExpanded ? record.description : truncatedDescription}
        </p>
        {record.description.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gold text-sm font-medium mt-2 hover:text-gold-dark transition-colors"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Media */}
      {record.media_url && (
        <div className="px-4 pb-4">
          <img
            src={record.media_url}
            alt={record.title}
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Previous Record Holder */}
      {record.broken_by && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Previous Record History
          </button>
          {showHistory && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Previous Holder:</span> {record.broken_by.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Broken {formatDistanceToNow(new Date(record.broken_by.broken_at), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reaction & Share Buttons */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-3">
            <ReactionButtons recordId={record.id} />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 hover:text-gold transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{record.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="gap-2 hover:text-gold transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" variant="gold" className="gap-2">
            Break Record
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border">
          <CommentThread recordId={record.id} />
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        recordId={record.id}
        recordTitle={record.title}
      />
    </Card>
  );
};
