import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { RecordFilters, FilterState } from '@/components/RecordFilters';
import { RecordCard } from '@/components/RecordCard';
import { useInfiniteRecords } from '@/hooks/useInfiniteRecords';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: 'all',
    dateRange: 'all',
    sortBy: 'newest',
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteRecords(filters);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Real-time subscription for new and updated records
  useEffect(() => {
    const channel = supabase
      .channel('records-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'records',
          filter: 'status=eq.verified'
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'records'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.8 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allRecords = data?.pages.flatMap((page) => page.records) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Filters */}
      <RecordFilters onFilterChange={setFilters} />

      {/* Records Feed */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : allRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No records found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or be the first to create a record!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {allRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
              {!hasNextPage && allRecords.length > 0 && (
                <p className="text-muted-foreground">No more records to load</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
