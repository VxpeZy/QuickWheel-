import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Bike, ShoppingBag, Users, LogOut, LogIn, User, Clock, CreditCard, BarChart, Bell, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MessagingIcon } from "@/components/messaging/MessagingIcon";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="flex gap-4 items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <MessagingIcon />
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.username || user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Wheel Delivery Thailand</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            บริการส่งอาหารที่รวดเร็วและเชื่อถือได้ เชื่อมต่อลูกค้ากับร้านอาหารท้องถิ่นและไรเดอร์ในประเทศไทย
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/customer')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>สำหรับลูกค้า</CardTitle>
              <CardDescription>
                สั่งอาหารโปรดจากร้านอาหารท้องถิ่น
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => navigate('/customer')}
              >
                สั่งอาหาร
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/restaurant')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>สำหรับร้านอาหาร</CardTitle>
              <CardDescription>
                จัดการเมนูและรับออเดอร์จากลูกค้า
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => navigate('/restaurant')}
              >
                ระบบร้านอาหาร
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/rider')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Bike className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>สำหรับไรเดอร์</CardTitle>
              <CardDescription>
                รับงานส่งอาหารและหารายได้ตามเวลาที่ต้องการ
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700" 
                onClick={() => navigate('/rider')}
              >
                แดชบอร์ดไรเดอร์
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Demo Cards */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-8">
          {/* Order Tracking Demo Card */}
          <Card className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">Real-Time Order Tracking</CardTitle>
              <CardDescription className="text-purple-600">
                Try our new real-time order tracking system that lets customers track their orders from preparation to delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => navigate('/order-tracking-demo')}
              >
                Try Order Tracking Demo
              </Button>
            </CardContent>
          </Card>

          {/* Messaging Demo Card */}
          <Card className="border-2 border-indigo-200 bg-indigo-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-indigo-800">In-App Messaging</CardTitle>
              <CardDescription className="text-indigo-600">
                Experience our new messaging system that enables real-time communication between customers, restaurants, and riders
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={() => navigate('/messages')}
              >
                Try Messaging System
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Demo Card */}
          <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Push Notifications</CardTitle>
              <CardDescription className="text-red-600">
                Try our new notification system that keeps you updated on order status, messages, and promotions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700" 
                onClick={() => navigate('/notification-settings')}
              >
                Manage Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Feature Cards */}
        <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-3 gap-8">
          {/* Payment Demo Card */}
          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">PromptPay QR Payment</CardTitle>
              <CardDescription className="text-green-600">
                Experience our new PromptPay QR code payment system for fast and secure transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => navigate('/payment-demo')}
              >
                Try PromptPay Payment Demo
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Dashboard Card */}
          <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">Business Analytics</CardTitle>
              <CardDescription className="text-blue-600">
                Explore our new analytics dashboard with detailed insights for restaurants, riders, and administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => navigate('/analytics')}
              >
                View Analytics Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">เข้าร่วมกับผู้ใช้งานหลายพันคนที่พึงพอใจ</p>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-blue-600">10,000+</span>
              <span>ลูกค้าที่ใช้งาน</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-green-600">2,000+</span>
              <span>ร้านอาหารพาร์ทเนอร์</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-orange-600">500+</span>
              <span>ไรเดอร์ที่ใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

