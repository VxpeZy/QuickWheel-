// src/components/analytics/TopPerformersTables.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopRestaurantsProps {
  data: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

interface TopRidersProps {
  data: Array<{
    id: string;
    name: string;
    deliveries: number;
  }>;
}

interface TopCustomersProps {
  data: Array<{
    id: string;
    name: string;
    spent: number;
    orders: number;
  }>;
}

export const TopRestaurantsTable = ({ data }: TopRestaurantsProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Restaurants</CardTitle>
        <CardDescription>Restaurants with highest revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">{restaurant.name}</TableCell>
                <TableCell className="text-right">
                  ฿{restaurant.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const TopRidersTable = ({ data }: TopRidersProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Riders</CardTitle>
        <CardDescription>Riders with most deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rider</TableHead>
              <TableHead className="text-right">Deliveries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell className="font-medium">{rider.name}</TableCell>
                <TableCell className="text-right">{rider.deliveries}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const TopCustomersTable = ({ data }: TopCustomersProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>Customers with highest spending</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-right">{customer.orders}</TableCell>
                <TableCell className="text-right">
                  ฿{customer.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

