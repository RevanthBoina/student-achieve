import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const REACTION_TYPES = [
  { type: 'amazing', emoji: '🙌', label: 'Hands-off (Amazing)' },
  { type: 'funny', emoji: '🤣', label: 'Laughing (Funny)' },
  { type: 'respect', emoji: '🫡', label: 'Saluting (Respect)' },
  { type: 'inspiring', emoji: '🫶🏻', label: 'Support (Inspiring)' },
  { type: 'risky', emoji: '☠️', label: 'Dangerous (Risky)' },
  { type: 'unbelievable', emoji: '🤯', label: 'Mind Blowing' },
];

interface ReactionButtonsProps {
  recordId: string;
}

interface Reaction {
  id: string;
  type: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const ReactionButtons = ({ recordId }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`reactions:${recordId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `record_id=eq.${recordId}`,
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordId, user]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        id,
        type,
        user_id,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('record_id', recordId);

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    setReactions(data as any);
    
    if (user) {
      const userRx = data.find((r) => r.user_id === user.id);
      setUserReaction(userRx?.type || null);
    }
  };

  const handleReaction = async (type: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to react to records',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // If clicking same reaction, remove it
      if (userReaction === type) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('record_id', recordId)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserReaction(null);
      } else {
        // Remove existing reaction first
        if (userReaction) {
          await supabase
            .from('reactions')
            .delete()
            .eq('record_id', recordId)
            .eq('user_id', user.id);
        }

        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            record_id: recordId,
            user_id: user.id,
            type: type as Database['public']['Enums']['reaction_type'],
          });

        if (error) throw error;
        setUserReaction(type);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getReactionCount = (type: string) => {
    return reactions.filter((r) => r.type === type).length;
  };

  const getRecentReactors = (type: string) => {
    return reactions
      .filter((r) => r.type === type)
      .slice(0, 5)
      .map((r) => r.user);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map(({ type, emoji, label }) => {
        const count = getReactionCount(type);
        const isActive = userReaction === type;
        const recentReactors = getRecentReactors(type);

        return (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction(type)}
                disabled={loading}
                className="gap-1.5 relative"
              >
                <span className="text-lg">{emoji}</span>
                {count > 0 && <span className="text-sm">{count}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">{label}</p>
              {recentReactors.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {recentReactors.map((reactor, idx) => (
                    <Avatar key={idx} className="h-6 w-6">
                      <AvatarImage src={reactor?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {reactor?.full_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {count > 5 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      +{count - 5} more
                    </span>
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
