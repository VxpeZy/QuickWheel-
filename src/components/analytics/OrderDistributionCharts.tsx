// src/components/analytics/OrderDistributionCharts.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface OrdersByHourProps {
  data: Array<{
    hour: number;
    count: number;
  }>;
}

interface OrdersByDayProps {
  data: Array<{
    day: number;
    count: number;
  }>;
}

const formatHour = (hour: number) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

const formatDay = (day: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
};

export const OrdersByHourChart = ({ data }: OrdersByHourProps) => {
  // Format the hour for display
  const formattedData = data.map(item => ({
    ...item,
    formattedHour: formatHour(item.hour)
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Orders by Time of Day</CardTitle>
        <CardDescription>Distribution of orders by hour</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedHour" 
                tick={{ fontSize: 10 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip 
                formatter={(value) => [`${value} orders`, 'Orders']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="count"
                name="Orders"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const OrdersByDayChart = ({ data }: OrdersByDayProps) => {
  // Format the day for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDay: formatDay(item.day)
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Orders by Day of Week</CardTitle>
        <CardDescription>Distribution of orders by day</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDay" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip 
                formatter={(value) => [`${value} orders`, 'Orders']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="count"
                name="Orders"
                fill="#4ade80"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

