// src/components/analytics/MetricsCards.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard = ({ title, value, description, icon, trend }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {(description || trend) && (
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend && (
            <span className={cn(
              "mr-1 flex items-center",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
            </span>
          )}
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);

interface MetricsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  previousPeriod?: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCustomers: number;
  };
}

export const MetricsCards = ({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  totalCustomers,
  previousPeriod
}: MetricsCardsProps) => {
  // Calculate trends if previous period data is available
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return undefined;
    const percentChange = Math.round(((current - previous) / previous) * 100);
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange >= 0
    };
  };

  const ordersTrend = previousPeriod ? calculateTrend(totalOrders, previousPeriod.totalOrders) : undefined;
  const revenueTrend = previousPeriod ? calculateTrend(totalRevenue, previousPeriod.totalRevenue) : undefined;
  const aovTrend = previousPeriod ? calculateTrend(averageOrderValue, previousPeriod.averageOrderValue) : undefined;
  const customersTrend = previousPeriod ? calculateTrend(totalCustomers, previousPeriod.totalCustomers) : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Orders"
        value={totalOrders.toLocaleString()}
        description="All orders in selected period"
        icon={<Package className="h-4 w-4" />}
        trend={ordersTrend}
      />
      <MetricCard
        title="Total Revenue"
        value={`฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        description="All revenue in selected period"
        icon={<DollarSign className="h-4 w-4" />}
        trend={revenueTrend}
      />
      <MetricCard
        title="Average Order Value"
        value={`฿${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        description="Average value per order"
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={aovTrend}
      />
      <MetricCard
        title="Total Customers"
        value={totalCustomers.toLocaleString()}
        description="Unique customers in period"
        icon={<Users className="h-4 w-4" />}
        trend={customersTrend}
      />
    </div>
  );
};

