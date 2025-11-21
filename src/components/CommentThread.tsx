import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Heart, Reply } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

interface CommentThreadProps {
  recordId: string;
}

export const CommentThread = ({ recordId }: CommentThreadProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        parent_id,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("record_id", recordId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading comments:", error);
      return;
    }

    // Normalize response to Comment[] shape
    const formatted: Comment[] = (data || []).map((row: any) => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      user_id: row.user_id,
      parent_id: row.parent_id,
      profile: {
        full_name: row.profiles?.full_name || "Unknown",
        avatar_url: row.profiles?.avatar_url,
      },
    }));

    setComments(formatted);
  }, [recordId]);

  useEffect(() => {
    loadComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:${recordId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `record_id=eq.${recordId}`,
        },
        () => {
          loadComments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordId, loadComments]);
  

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("comments").insert({
        record_id: recordId,
        user_id: user.id,
        content: newComment,
        parent_id: replyTo,
      });

      if (error) {
        // Handle rate limit errors gracefully
        if (
          error.message.includes("rate limit") ||
          error.message.includes("limit reached")
        ) {
          toast({
            title: "Rate limit exceeded",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      setNewComment("");
      setReplyTo(null);
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);

  const getReplies = (commentId: string) => {
    return comments.filter((c) => c.parent_id === commentId);
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const replies = getReplies(comment.id);
    const canReply = depth < 2; // Max 2 levels deep

    return (
      <div className={depth > 0 ? "ml-8 mt-3" : "mt-3"}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profile.avatar_url} />
            <AvatarFallback>{comment.profile.full_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-3">
              <p className="font-semibold text-sm">
                {comment.profile.full_name}
              </p>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
              <button className="hover:text-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> Like
              </button>
              {canReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" /> Reply
                </button>
              )}
            </div>
          </div>
        </div>
        {replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Add Comment */}
      <div className="mb-4">
        {replyTo && (
          <div className="mb-2 text-sm text-muted-foreground">
            Replying to comment
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="ml-2"
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim()}
              className="mt-2"
              size="sm"
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-1">
          {topLevelComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};
