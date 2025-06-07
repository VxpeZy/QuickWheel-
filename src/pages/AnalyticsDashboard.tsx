// src/pages/AnalyticsDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { MetricsCards } from "@/components/analytics/MetricsCards";
import { OrdersChart } from "@/components/analytics/OrdersChart";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { OrdersByHourChart, OrdersByDayChart } from "@/components/analytics/OrderDistributionCharts";
import { TopRestaurantsTable, TopRidersTable, TopCustomersTable } from "@/components/analytics/TopPerformersTables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    filters,
    updateFilters,
    resetFilters,
    orderMetrics,
    restaurantMetrics,
    riderMetrics,
    customerMetrics,
    ordersTimeSeries,
    revenueTimeSeries,
    ordersByHourDistribution,
    ordersByDayDistribution,
    loading
  } = useAnalytics();

  // Extract unique restaurants and riders for filters
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [riders, setRiders] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Extract unique restaurants
    const uniqueRestaurants = restaurantMetrics.topRestaurantsByRevenue.map(r => ({
      id: r.id,
      name: r.name
    }));
    setRestaurants(uniqueRestaurants);

    // Extract unique riders
    const uniqueRiders = riderMetrics.topRidersByDeliveries.map(r => ({
      id: r.id,
      name: r.name
    }));
    setRiders(uniqueRiders);
  }, [restaurantMetrics, riderMetrics]);

  // Function to export data as CSV
  const exportData = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Date,Orders,Revenue\n";
    
    // Combine orders and revenue data
    const combinedData = ordersTimeSeries.map(orderData => {
      const revenueData = revenueTimeSeries.find(r => r.date === orderData.date);
      return {
        date: orderData.date,
        orders: orderData.count,
        revenue: revenueData ? revenueData.amount : 0
      };
    });
    
    // Add data rows
    combinedData.forEach(row => {
      csvContent += `${row.date},${row.orders},${row.revenue}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quick-wheel-analytics.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-center">Analytics Dashboard</h1>
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
          restaurants={restaurants}
          riders={riders}
        />

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="riders">Riders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] w-full" />
                  ))}
                </div>
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-[350px] w-full" />
                  <Skeleton className="h-[350px] w-full" />
                </div>
              </div>
            ) : (
              <>
                {/* Metrics Cards */}
                <MetricsCards
                  totalOrders={orderMetrics.totalOrders}
                  totalRevenue={orderMetrics.totalRevenue}
                  averageOrderValue={orderMetrics.averageOrderValue}
                  totalCustomers={customerMetrics.totalCustomers}
                />

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-4">
                  <OrdersChart data={ordersTimeSeries} />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <RevenueChart data={revenueTimeSeries} />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <OrdersByHourChart data={ordersByHourDistribution} />
                  <OrdersByDayChart data={ordersByDayDistribution} />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <TopRestaurantsTable data={restaurantMetrics.topRestaurantsByRevenue} />
                  <TopRidersTable data={riderMetrics.topRidersByDeliveries} />
                </div>
              </>
            )}
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] w-full" />
                  ))}
                </div>
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
              </div>
            ) : (
              <>
                {/* Restaurant Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Restaurants"
                    value={restaurantMetrics.totalRestaurants}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Orders"
                    value={restaurantMetrics.totalOrders}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Revenue"
                    value={`฿${restaurantMetrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Avg. Preparation Time"
                    value={`${Math.round(restaurantMetrics.averagePreparationTime)} min`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                </div>

                {/* Top Restaurants Table */}
                <div className="grid gap-4 md:grid-cols-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Restaurants</CardTitle>
                      <CardDescription>Restaurants with highest revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Restaurant</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Orders</TableHead>
                            <TableHead className="text-right">Avg. Order Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {restaurantMetrics.topRestaurantsByRevenue.map((restaurant) => (
                            <TableRow key={restaurant.id}>
                              <TableCell className="font-medium">{restaurant.name}</TableCell>
                              <TableCell className="text-right">
                                ฿{restaurant.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {Math.round(restaurant.revenue / orderMetrics.averageOrderValue)}
                              </TableCell>
                              <TableCell className="text-right">
                                ฿{(restaurant.revenue / Math.round(restaurant.revenue / orderMetrics.averageOrderValue)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Riders Tab */}
          <TabsContent value="riders" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] w-full" />
                  ))}
                </div>
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
              </div>
            ) : (
              <>
                {/* Rider Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Riders"
                    value={riderMetrics.totalRiders}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Deliveries"
                    value={riderMetrics.totalDeliveries}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Earnings"
                    value={`฿${riderMetrics.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Avg. Delivery Time"
                    value={`${Math.round(riderMetrics.averageDeliveryTime)} min`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                </div>

                {/* Top Riders Table */}
                <div className="grid gap-4 md:grid-cols-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Riders</CardTitle>
                      <CardDescription>Riders with most deliveries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rider</TableHead>
                            <TableHead className="text-right">Deliveries</TableHead>
                            <TableHead className="text-right">Earnings</TableHead>
                            <TableHead className="text-right">Avg. Delivery Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {riderMetrics.topRidersByDeliveries.map((rider) => (
                            <TableRow key={rider.id}>
                              <TableCell className="font-medium">{rider.name}</TableCell>
                              <TableCell className="text-right">{rider.deliveries}</TableCell>
                              <TableCell className="text-right">
                                ฿{(rider.deliveries * (riderMetrics.totalEarnings / riderMetrics.totalDeliveries)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {Math.round(riderMetrics.averageDeliveryTime)} min
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] w-full" />
                  ))}
                </div>
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
              </div>
            ) : (
              <>
                {/* Customer Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Customers"
                    value={customerMetrics.totalCustomers}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Orders"
                    value={customerMetrics.totalOrders}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Total Spent"
                    value={`฿${customerMetrics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <MetricCard
                    title="Avg. Order Value"
                    value={`฿${customerMetrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<BarChart className="h-4 w-4" />}
                  />
                </div>

                {/* Top Customers Table */}
                <div className="grid gap-4 md:grid-cols-1">
                  <TopCustomersTable data={customerMetrics.topCustomersBySpending} />
                </div>

                {/* Order Time Distribution */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Order Days</CardTitle>
                      <CardDescription>Most frequent days for ordering</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead className="text-right">Orders</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerMetrics.mostPopularOrderDays.slice(0, 5).map((day) => (
                            <TableRow key={day.dayOfWeek}>
                              <TableCell className="font-medium">{formatDay(day.dayOfWeek)}</TableCell>
                              <TableCell className="text-right">{day.count}</TableCell>
                              <TableCell className="text-right">
                                {Math.round((day.count / customerMetrics.totalOrders) * 100)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Order Hours</CardTitle>
                      <CardDescription>Most frequent times for ordering</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Orders</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerMetrics.mostPopularOrderHours.slice(0, 5).map((hour) => (
                            <TableRow key={hour.hour}>
                              <TableCell className="font-medium">{formatHour(hour.hour)}</TableCell>
                              <TableCell className="text-right">{hour.count}</TableCell>
                              <TableCell className="text-right">
                                {Math.round((hour.count / customerMetrics.totalOrders) * 100)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, icon }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// Helper functions
const formatHour = (hour: number) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

const formatDay = (day: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
};

// Import components used in the tabs
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default AnalyticsDashboard;

