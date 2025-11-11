import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/components/RecordFilters';

const RECORDS_PER_PAGE = 20;

interface Record {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  engagement_score: number;
  category: {
    id: string;
    name: string;
  };
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
  broken_by?: {
    id: string;
    full_name: string;
    broken_at: string;
  };
}

export const useInfiniteRecords = (filters: FilterState) => {
  return useInfiniteQuery({
    queryKey: ['records', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('records')
        .select(
          `
          id,
          title,
          description,
          media_url,
          created_at,
          reactions_count,
          comments_count,
          engagement_score,
          category:categories (
            id,
            name
          ),
          profile:profiles!records_user_id_fkey (
            id,
            full_name,
            avatar_url,
            is_verified
          ),
          broken_by:profiles!records_broken_by_fkey (
            id,
            full_name
          ),
          broken_at
        `,
          { count: 'exact' }
        )
        .eq('status', 'verified');

      // Apply filters
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.dateRange !== 'all') {
        const daysAgo = filters.dateRange === '7days' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        query = query.gte('created_at', date.toISOString());
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'popular':
          query = query.order('reactions_count', { ascending: false });
          break;
        case 'trending':
          query = query.order('engagement_score', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      const from = pageParam * RECORDS_PER_PAGE;
      const to = from + RECORDS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        records: (data as unknown as Record[]) || [],
        nextPage: data && data.length === RECORDS_PER_PAGE ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
