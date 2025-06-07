
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'customer' | 'admin' | 'rider';
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          address: formData.address || null
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัปเดตโปรไฟล์ได้",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "สำเร็จ",
        description: "อัปเดตโปรไฟล์เรียบร้อยแล้ว"
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตโปรไฟล์ได้",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'customer':
        return 'ผู้ใช้งาน';
      case 'rider':
        return 'ไรเดอร์';
      case 'admin':
        return 'ผู้ดูแลระบบ';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'rider':
        return 'default' as const;
      case 'customer':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ</p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full mt-4"
            >
              เข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">การตั้งค่าโปรไฟล์</h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {profile.full_name || profile.username || 'ผู้ใช้งาน'}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(profile.role)}>
                {getRoleDisplayName(profile.role)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="กรอกชื่อผู้ใช้"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.username || 'ยังไม่ได้กำหนด'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="full_name">ชื่อเต็ม</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="กรอกชื่อเต็ม"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.full_name || 'ยังไม่ได้กำหนด'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="กรอกหมายเลขโทรศัพท์"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.phone || 'ยังไม่ได้กำหนด'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="กรอกที่อยู่"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.address || 'ยังไม่ได้กำหนด'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: profile.username || '',
                          full_name: profile.full_name || '',
                          phone: profile.phone || '',
                          address: profile.address || ''
                        });
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    แก้ไขโปรไฟล์
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบทบาท</CardTitle>
            <CardDescription>
              บทบาทและสิทธิ์ของบัญชีของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">บทบาทปัจจุบัน:</span>
                <Badge variant={getRoleBadgeVariant(profile.role)}>
                  {getRoleDisplayName(profile.role)}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                {profile.role === 'customer' && (
                  <p>ในฐานะผู้ใช้งาน คุณสามารถเรียกดูร้านอาหาร สั่งอาหาร และติดตามการจัดส่งได้</p>
                )}
                {profile.role === 'rider' && (
                  <p>ในฐานะไรเดอร์ คุณสามารถรับออเดอร์จัดส่ง จัดการเส้นทาง และหารายได้ได้</p>
                )}
                {profile.role === 'admin' && (
                  <p>ในฐานะผู้ดูแลระบบ คุณมีสิทธิ์เต็มในการจัดการแพลตฟอร์ม ผู้ใช้ และออเดอร์</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
