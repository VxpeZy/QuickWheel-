import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus, MapPin, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/hooks/useOrders';

interface CartItem {
  id: string;
  name: string;
  name_th: string;
  price: number;
  description: string;
  quantity: number;
}

interface Restaurant {
  id: string;
  name: string;
  name_th: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  menu: Omit<CartItem, 'quantity'>[];
}

const CustomerDashboard = () => {
  const { toast } = useToast();
  const { createOrder, orders, loading } = useOrders();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const restaurants: Restaurant[] = [
    {
      id: 'som-tam-paradise',
      name: 'Som Tam Paradise',
      name_th: 'ส้มตำสวรรค์',
      cuisine: 'อาหารอีสาน',
      rating: 4.8,
      deliveryTime: '25-35 นาที',
      deliveryFee: 25,
      minOrder: 100,
      menu: [
        { id: '1', name: 'Som Tam Thai', name_th: 'ส้มตำไทย', price: 45, description: 'ส้มตำรสชาติดั้งเดิม เปรี้ยวหวานเค็ม' },
        { id: '2', name: 'Larb Moo', name_th: 'ลาบหมู', price: 55, description: 'ลาบหมูสับสดใส่เครื่องเทศหอม' },
        { id: '3', name: 'Grilled Chicken', name_th: 'ไก่ย่าง', price: 65, description: 'ไก่ย่างหอมเครื่องเทศ เสิร์ฟพร้อมเจี้ยวแจ่ว' }
      ]
    },
    {
      id: 'noodle-heaven',
      name: 'Noodle Heaven',
      name_th: 'สวรรค์ก๋วยเตี๋ยว',
      cuisine: 'ก๋วยเตี๋ยว',
      rating: 4.6,
      deliveryTime: '20-30 นาที',
      deliveryFee: 20,
      minOrder: 80,
      menu: [
        { id: '4', name: 'Boat Noodles', name_th: 'ก๋วยเตี๋ยวเรือ', price: 35, description: 'ก๋วยเตี๋ยวเรือรสเข้มข้น' },
        { id: '5', name: 'Tom Yum Noodles', name_th: 'ก๋วยเตี๋ยวต้มยำ', price: 40, description: 'ก๋วยเตี๋ยวต้มยำรสจัดจ้าน' },
        { id: '6', name: 'Pad Thai', name_th: 'ผัดไทย', price: 50, description: 'ผัดไทยรสชาติหวานนำเค็มตาม' }
      ]
    }
  ];

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) {
      toast({
        title: "ไม่สามารถสั่งได้",
        description: "กรุณาเลือกร้านอาหารและเพิ่มสินค้าในตะกร้า",
        variant: "destructive"
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = getTotalAmount();
    if (totalAmount < selectedRestaurant.minOrder) {
      toast({
        title: "ยอดสั่งซื้อต่ำเกินไป",
        description: `ยอดขั้นต่ำ ฿${selectedRestaurant.minOrder}`,
        variant: "destructive"
      });
      return;
    }

    try {
      await createOrder({
        restaurant_id: selectedRestaurant.id,
        restaurant_name: selectedRestaurant.name_th,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cart,
        total_amount: totalAmount,
        delivery_fee: selectedRestaurant.deliveryFee,
        estimated_delivery_time: selectedRestaurant.deliveryTime,
        coordinates: { lat: 13.7563, lng: 100.5018 } // Bangkok coordinates as default
      });

      // Clear cart and customer info after successful order
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setSelectedRestaurant(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-purple-500';
      case 'picked_up': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">สั่งอาหารออนไลน์</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Restaurant List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">ร้านอาหารแนะนำ</h2>
            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <Card 
                  key={restaurant.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRestaurant?.id === restaurant.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{restaurant.name_th}</CardTitle>
                        <CardDescription>{restaurant.cuisine}</CardDescription>
                      </div>
                      <Badge variant="outline">⭐ {restaurant.rating}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>ค่าส่ง ฿{restaurant.deliveryFee}</span>
                      </div>
                    </div>
                    
                    {selectedRestaurant?.id === restaurant.id && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">เมนูอาหาร</h4>
                        <div className="space-y-3">
                          {restaurant.menu.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium">{item.name_th}</h5>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <p className="font-semibold text-green-600 mt-1">฿{item.price}</p>
                              </div>
                              <Button onClick={() => addToCart(item)} size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart and Order Form */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  ตะกร้าสินค้า ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">ตะกร้าว่าง</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <h6 className="font-medium">{item.name_th}</h6>
                          <p className="text-sm text-green-600">฿{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>รวม:</span>
                        <span>฿{getTotalAmount()}</span>
                      </div>
                      {selectedRestaurant && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>ค่าส่ง:</span>
                          <span>฿{selectedRestaurant.deliveryFee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="กรอกที่อยู่สำหรับการจัดส่ง"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    สั่งอาหาร (฿{getTotalAmount() + (selectedRestaurant?.deliveryFee || 0)})
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">ประวัติการสั่งซื้อ</h2>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.restaurant_name}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">รายการอาหาร:</p>
                        <div className="text-sm text-gray-600">
                          {order.items.map((item: any, index: number) => (
                            <div key={index}>
                              {item.name_th} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{order.customer_address}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">฿{order.total_amount + order.delivery_fee}</p>
                        <p className="text-sm text-gray-600">รวมค่าส่ง ฿{order.delivery_fee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
