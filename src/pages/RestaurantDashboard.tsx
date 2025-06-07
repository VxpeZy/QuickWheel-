
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, CheckCircle, XCircle, Bell, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders, Order } from '@/hooks/useOrders';

const RestaurantDashboard = () => {
  const { toast } = useToast();
  const { orders, loading, updateOrderStatus, refetch } = useOrders();
  const [restaurantStatus, setRestaurantStatus] = useState<'open' | 'closed' | 'busy'>('open');

  // Filter orders for this restaurant (you might want to add restaurant filtering logic)
  const restaurantOrders = orders;

  const acceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'accepted');
      toast({
        title: "คำสั่งซื้อได้รับการยอมรับ!",
        description: "คำสั่งซื้อกำลังเตรียม",
      });
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const markAsReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'ready');
      toast({
        title: "คำสั่งซื้อพร้อมแล้ว!",
        description: "คำสั่งซื้อพร้อมสำหรับไรเดอร์มารับ",
      });
    } catch (error) {
      console.error('Error marking order as ready:', error);
    }
  };

  const markAsPickedUp = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'picked_up');
      toast({
        title: "คำสั่งซื้อถูกรับแล้ว!",
        description: "คำสั่งซื้อถูกไรเดอร์รับไปแล้ว",
      });
    } catch (error) {
      console.error('Error marking order as picked up:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'cancelled');
      toast({
        title: "คำสั่งซื้อถูกยกเลิก",
        description: "คำสั่งซื้อได้ถูกยกเลิกแล้ว",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-gray-100 text-gray-800';
      case 'delivered': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอการยอมรับ';
      case 'accepted': return 'ยอมรับแล้ว';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมรับ';
      case 'picked_up': return 'รับแล้ว';
      case 'delivered': return 'ส่งแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getRestaurantStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'closed': return 'bg-red-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRestaurantStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'เปิด';
      case 'closed': return 'ปิด';
      case 'busy': return 'ยุ่ง';
      default: return status;
    }
  };

  const toggleRestaurantStatus = () => {
    setRestaurantStatus(prev => {
      if (prev === 'open') return 'busy';
      if (prev === 'busy') return 'closed';
      return 'open';
    });
  };

  const newOrders = restaurantOrders.filter(order => order.status === 'pending');
  const activeOrders = restaurantOrders.filter(order => ['accepted', 'preparing', 'ready'].includes(order.status));
  const completedOrders = restaurantOrders.filter(order => ['picked_up', 'delivered'].includes(order.status));

  const todaysRevenue = completedOrders.reduce((total, order) => total + order.total_amount, 0);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดร้านอาหาร</h1>
              <p className="text-gray-600">จัดการคำสั่งซื้อของร้าน</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">รายได้วันนี้</p>
                <p className="text-2xl font-bold text-green-600">฿{todaysRevenue.toFixed(2)}</p>
              </div>
              <Badge className={`${getRestaurantStatusColor(restaurantStatus)} text-white`}>
                {getRestaurantStatusText(restaurantStatus)}
              </Badge>
              <Button onClick={toggleRestaurantStatus} variant="outline">
                เปลี่ยนสถานะ
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">คำสั่งซื้อใหม่</p>
                  <p className="text-2xl font-bold">{newOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">คำสั่งซื้อที่ดำเนินการ</p>
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้นวันนี้</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">รายได้</p>
                  <p className="text-2xl font-bold">฿{todaysRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Orders */}
        {newOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              คำสั่งซื้อใหม่ ({newOrders.length})
            </h2>
            <div className="grid gap-4">
              {newOrders.map((order) => (
                <Card key={order.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">คำสั่งซื้อ #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {order.customer_name} • {formatDateTime(order.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">รายการอาหาร:</h4>
                        {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t mt-2 pt-2">
                          <div className="flex justify-between text-sm">
                            <span>ค่าจัดส่ง:</span>
                            <span>฿{order.delivery_fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>รวมทั้งหมด:</span>
                            <span>฿{order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm mb-1"><strong>โทรศัพท์:</strong> {order.customer_phone}</p>
                        <p className="text-sm mb-3"><strong>ที่อยู่:</strong> {order.customer_address}</p>
                        {order.estimated_delivery_time && (
                          <p className="text-sm text-gray-600">เวลาจัดส่งโดยประมาณ: {order.estimated_delivery_time}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => acceptOrder(order.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        รับคำสั่งซื้อ
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => cancelOrder(order.id)}
                        className="px-6"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        ปฏิเสธ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">คำสั่งซื้อที่ดำเนินการ ({activeOrders.length})</h2>
            <div className="grid gap-4">
              {activeOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">คำสั่งซื้อ #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {order.customer_name} • {formatDateTime(order.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">รายการอาหาร:</h4>
                        {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t mt-2 pt-2">
                          <div className="flex justify-between text-sm">
                            <span>ค่าจัดส่ง:</span>
                            <span>฿{order.delivery_fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>รวมทั้งหมด:</span>
                            <span>฿{order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm mb-1"><strong>โทรศัพท์:</strong> {order.customer_phone}</p>
                        <p className="text-sm mb-3"><strong>ที่อยู่:</strong> {order.customer_address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(order.status === 'accepted' || order.status === 'preparing') && (
                        <Button 
                          onClick={() => markAsReady(order.id)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          พร้อมแล้ว
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button 
                          onClick={() => markAsPickedUp(order.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          รับแล้ว
                        </Button>
                      )}
                      <Button variant="outline" className="px-6">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {restaurantStatus === 'closed' && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">ร้านปิดอยู่ในขณะนี้</p>
              <p className="text-sm text-gray-400 mb-4">เปลี่ยนสถานะเป็น "เปิด" เพื่อเริ่มรับคำสั่งซื้อ</p>
              <Button onClick={toggleRestaurantStatus}>เปิดร้าน</Button>
            </CardContent>
          </Card>
        )}

        {activeOrders.length === 0 && newOrders.length === 0 && restaurantStatus === 'open' && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">ไม่มีคำสั่งซื้อในขณะนี้</p>
              <p className="text-sm text-gray-400 mt-2">คำสั่งซื้อใหม่จะปรากฏที่นี่โดยอัตโนมัติ</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
