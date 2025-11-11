import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RecordFilters, FilterState } from '@/components/RecordFilters';
import { RecordCard } from '@/components/RecordCard';
import { useInfiniteRecords } from '@/hooks/useInfiniteRecords';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  } = useInfiniteRecords(filters);

  const observerTarget = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allRecords = data?.pages.flatMap((page) => page.records) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-20 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Book of World Records</h1>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button onClick={() => navigate('/create-record')} size="sm">
                  Create Record
                </Button>
                <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
                  Profile
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} size="sm">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')} variant="outline" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

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
            {user && (
              <Button onClick={() => navigate('/create-record')} className="mt-4">
                Create First Record
              </Button>
            )}
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
