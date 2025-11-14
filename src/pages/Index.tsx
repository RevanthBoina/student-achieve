import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { RecordFilters, FilterState } from '@/components/RecordFilters';
import { RecordCard } from '@/components/RecordCard';
import { Footer } from '@/components/Footer';
import { useInfiniteRecords } from '@/hooks/useInfiniteRecords';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy } from 'lucide-react';
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

      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6 leading-tight">
              Celebrate Student Achievements Worldwide
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 font-light">
              Verify. Inspire. Immortalize.
            </p>
            <Link to="/create-break">
              <Button size="lg" variant="gold" className="text-base shadow-lg">
                Explore Records
              </Button>
            </Link>
          </div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Statistics Bar */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="text-3xl md:text-4xl font-bold text-gold font-poppins">
                {allRecords.length > 0 ? allRecords.length : '12,459'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Records</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="text-3xl md:text-4xl font-bold text-gold font-poppins">8,234</div>
              <div className="text-sm text-muted-foreground mt-1">Students</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-3xl md:text-4xl font-bold text-gold font-poppins">156</div>
              <div className="text-sm text-muted-foreground mt-1">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <RecordFilters onFilterChange={setFilters} />

      {/* Records Feed */}
      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-lg" />
            ))}
          </div>
        ) : allRecords.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-xl font-medium">No records found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or be the first to create a record!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {allRecords.map((record, idx) => (
                <div
                  key={record.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <RecordCard record={record} />
                </div>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              )}
              {!hasNextPage && allRecords.length > 0 && (
                <p className="text-muted-foreground">No more records to load</p>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
