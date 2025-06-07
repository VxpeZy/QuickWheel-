// src/components/analytics/AnalyticsFilters.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsFilters as FiltersType } from '@/hooks/useAnalytics';
import { CalendarIcon, FilterX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AnalyticsFiltersProps {
  filters: FiltersType;
  onUpdateFilters: (filters: Partial<FiltersType>) => void;
  onResetFilters: () => void;
  restaurants: Array<{ id: string; name: string }>;
  riders: Array<{ id: string; name: string }>;
}

export const AnalyticsFilters = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  restaurants,
  riders
}: AnalyticsFiltersProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      onUpdateFilters({ startDate: format(date, 'yyyy-MM-dd') });
    } else {
      onUpdateFilters({ startDate: undefined });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      onUpdateFilters({ endDate: format(date, 'yyyy-MM-dd') });
    } else {
      onUpdateFilters({ endDate: undefined });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Restaurant Filter */}
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant</Label>
            <Select
              value={filters.restaurantId || ''}
              onValueChange={(value) => onUpdateFilters({ restaurantId: value || undefined })}
            >
              <SelectTrigger id="restaurant">
                <SelectValue placeholder="All Restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Restaurants</SelectItem>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rider Filter */}
          <div className="space-y-2">
            <Label htmlFor="rider">Rider</Label>
            <Select
              value={filters.riderId || ''}
              onValueChange={(value) => onUpdateFilters({ riderId: value || undefined })}
            >
              <SelectTrigger id="rider">
                <SelectValue placeholder="All Riders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Riders</SelectItem>
                {riders.map((rider) => (
                  <SelectItem key={rider.id} value={rider.id}>
                    {rider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => onUpdateFilters({ status: value || undefined })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          <div className="col-span-1 md:col-span-5 flex justify-end">
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

