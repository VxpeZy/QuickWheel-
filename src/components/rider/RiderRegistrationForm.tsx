
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Phone, MapPin, User } from 'lucide-react';

const RiderRegistrationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    vehicleType: '',
    licenseNumber: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile to rider role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'rider',
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "สมัครเป็นไรเดอร์สำเร็จ!",
        description: "ข้อมูลของคุณได้รับการบันทึกแล้ว คุณสามารถเริ่มรับงานได้ทันที",
      });

      // Refresh the page to update the user role
      window.location.reload();
    } catch (error) {
      console.error('Error registering as rider:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสมัครเป็นไรเดอร์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">สมัครเป็นไรเดอร์</CardTitle>
          <CardDescription>
            กรอกข้อมูลเพื่อเริ่มต้นการทำงานเป็นไรเดอร์กับ Quick Wheel
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  ชื่อ-นามสกุล
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                ที่อยู่
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="กรอกที่อยู่ของคุณ"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">ประเภทยานพาหนะ</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  required
                  placeholder="เช่น มอเตอร์ไซค์, รถยนต์"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  หมายเลขใบขับขี่
                </Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  required
                  placeholder="หมายเลขใบขับขี่"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">ผู้ติดต่อฉุกเฉิน</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  required
                  placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">เบอร์ผู้ติดต่อฉุกเฉิน</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  required
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">ข้อตกลงการใช้งาน</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกเป็นความจริง</li>
                <li>• ข้าพเจ้ามีใบขับขี่ที่ถูกต้องและยังไม่หมดอายุ</li>
                <li>• ข้าพเจ้าจะปฏิบัติตามกฎระเบียบของบริษัท</li>
                <li>• ข้าพเจ้าจะให้บริการอย่างมืออาชีพและปลอดภัย</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
              size="lg"
            >
              {loading ? 'กำลังส่งข้อมูล...' : 'สมัครเป็นไรเดอร์'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiderRegistrationForm;
