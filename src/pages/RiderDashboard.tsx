
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Phone, Navigation, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRiderOrders } from '@/hooks/useRiderOrders';

const RiderDashboard = () => {
  const { toast } = useToast();
  const { availableOrders, activeOrder, loading, acceptOrder, updateOrderStatus } = useRiderOrders();
  const [riderStatus, setRiderStatus] = useState<'online' | 'offline' | 'delivering'>('offline');

  const navigateToCustomer = (coordinates?: { lat: number; lng: number }) => {
    if (!coordinates) {
      toast({
        title: "ไม่มีพิกัด",
        description: "ไม่สามารถนำทางได้เนื่องจากไม่มีข้อมูลพิกัด",
        variant: "destructive"
      });
      return;
    }

    const destination = `${coordinates.lat},${coordinates.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleAcceptOrder = async (orderId: string) => {
    await acceptOrder(orderId);
    setRiderStatus('delivering');
  };

  const markAsPickedUp = async () => {
    if (activeOrder) {
      await updateOrderStatus(activeOrder.id, 'picked_up');
    }
  };

  const markAsDelivered = async () => {
    if (activeOrder) {
      await updateOrderStatus(activeOrder.id, 'delivered');
      setRiderStatus('online');
    }
  };

  const contactSupport = () => {
    toast({
      title: "ติดต่อฝ่ายสนับสนุน",
      description: "โทร: 02-123-4567 หรือ Email: support@quickwheel.com",
    });
  };

  const toggleRiderStatus = () => {
    if (riderStatus === 'delivering') return;
    setRiderStatus(prev => prev === 'online' ? 'offline' : 'online');
    toast({
      title: riderStatus === 'offline' ? "คุณออนไลน์แล้ว!" : "คุณออฟไลน์แล้ว",
      description: riderStatus === 'offline' ? "คุณสามารถรับงานใหม่ได้" : "คุณจะไม่ได้รับงานใหม่",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'delivering': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'ออนไลน์';
      case 'offline': return 'ออฟไลน์';
      case 'delivering': return 'กำลังส่ง';
      default: return status;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รออนุมัติ';
      case 'accepted': return 'รับออเดอร์แล้ว';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมรับ';
      case 'picked_up': return 'กำลังส่ง';
      case 'delivered': return 'ส่งแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดไรเดอร์</h1>
              <p className="text-gray-600">ยินดีต้อนรับกลับมา!</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={contactSupport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                ติดต่อฝ่ายสนับสนุน
              </Button>
              <Badge className={`${getStatusColor(riderStatus)} text-white`}>
                {getStatusText(riderStatus)}
              </Badge>
              <Button 
                onClick={toggleRiderStatus}
                disabled={riderStatus === 'delivering'}
                variant={riderStatus === 'online' ? 'destructive' : 'default'}
              >
                {riderStatus === 'online' ? 'ออฟไลน์' : 'ออนไลน์'}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Order */}
        {activeOrder && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                งานที่รับแล้ว
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {activeOrder.status === 'accepted' && 'ต้องไปรับที่ร้าน'}
                  {activeOrder.status === 'picked_up' && 'พร้อมส่งให้ลูกค้า'}
                </Badge>
              </CardTitle>
              <CardDescription>ส่งให้ {activeOrder.customer_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{activeOrder.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{activeOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">฿{activeOrder.total_amount + activeOrder.delivery_fee}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">รายการอาหาร:</p>
                    <div className="text-sm text-gray-600">
                      {activeOrder.items.map((item: any, index: number) => (
                        <div key={index}>
                          {item.name_th} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigateToCustomer(activeOrder.coordinates)}
                    className="w-full"
                    variant="outline"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    นำทางด้วย Google Maps
                  </Button>
                  
                  {activeOrder.status === 'accepted' && (
                    <div className="space-y-2">
                      <p className="text-sm text-center text-blue-700 font-medium">
                        ขั้นตอนที่ 1: ไปรับอาหารที่ร้าน
                      </p>
                      <Button 
                        onClick={markAsPickedUp} 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        ✅ รับอาหารแล้ว
                      </Button>
                    </div>
                  )}
                  
                  {activeOrder.status === 'picked_up' && (
                    <div className="space-y-2">
                      <p className="text-sm text-center text-green-700 font-medium">
                        ขั้นตอนที่ 2: ส่งอาหารให้ลูกค้า
                      </p>
                      <Button 
                        onClick={markAsDelivered} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        ✅ ส่งสำเร็จแล้ว
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Orders */}
        {riderStatus === 'online' && !activeOrder && (
          <div>
            <h2 className="text-xl font-semibold mb-4">งานที่พร้อมรับ ({availableOrders.length})</h2>
            {availableOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">ไม่มีงานใหม่ในขณะนี้</p>
                  <p className="text-sm text-gray-400 mt-2">อยู่ออนไลน์เพื่อรับงานใหม่</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {availableOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                          <CardDescription>{order.customer_address}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          งานใหม่
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{order.estimated_delivery_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">฿{order.total_amount + order.delivery_fee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{order.customer_phone}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">รายการอาหาร:</p>
                        <div className="text-sm text-gray-600">
                          {order.items.map((item: any, index: number) => (
                            <div key={index}>
                              {item.name_th} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAcceptOrder(order.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          รับงาน
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => navigateToCustomer(order.coordinates)}
                          className="px-3"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {riderStatus === 'offline' && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">คุณออฟไลน์อยู่ในขณะนี้</p>
              <p className="text-sm text-gray-400 mb-4">เข้าสู่ระบบออนไลน์เพื่อเริ่มรับงาน</p>
              <Button onClick={toggleRiderStatus}>เข้าสู่ระบบออนไลน์</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;
