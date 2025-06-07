import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SecureRiderDashboard from "./pages/SecureRiderDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import HRDashboard from "./pages/HRDashboard";
import OrderTrackingDemoPage from "./pages/OrderTrackingDemoPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentDemoPage from "./pages/PaymentDemoPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotificationSettings from "./pages/NotificationSettings";
import MessagingPage from "./pages/MessagingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/restaurant" element={<RestaurantDashboard />} />
            <Route path="/rider" element={<SecureRiderDashboard />} />
            <Route path="/hr" element={<HRDashboard />} />
            <Route path="/order-tracking-demo" element={<OrderTrackingDemoPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/payment-demo" element={<PaymentDemoPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/messages/:threadId" element={<MessagingPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

