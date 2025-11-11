import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface RecordFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  categoryId: string;
  dateRange: 'all' | '7days' | '30days';
  sortBy: 'newest' | 'popular' | 'trending';
}

export const RecordFilters = ({ onFilterChange }: RecordFiltersProps) => {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: 'all',
    dateRange: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: 'all',
      dateRange: 'all',
      sortBy: 'newest',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.categoryId !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, category, or creator..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          {/* Category */}
          <Select
            value={filters.categoryId}
            onValueChange={(value) => updateFilter('categoryId', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Select
            value={filters.dateRange}
            onValueChange={(value) => updateFilter('dateRange', value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
