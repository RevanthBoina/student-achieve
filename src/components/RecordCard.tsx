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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={record.profile.avatar_url} alt={record.profile.full_name} />
          <AvatarFallback>{record.profile.full_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{record.profile.full_name}</span>
            {record.profile.is_verified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Posted {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
          </p>
        </div>
        <Badge variant="secondary">{record.category.name}</Badge>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="text-xl font-bold mb-2">{record.title}</h3>
        <p className="text-foreground/90 whitespace-pre-wrap">
          {isExpanded ? record.description : truncatedDescription}
        </p>
        {record.description.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary text-sm font-medium mt-1 hover:underline"
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

      {/* Reactions */}
      <div className="px-4 pb-4">
        <ReactionButtons recordId={record.id} />
      </div>

      {/* Action Bar */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {record.comments_count} {record.comments_count === 1 ? 'Comment' : 'Comments'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            Break Record
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
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
