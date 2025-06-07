
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Phone, MapPin, User, FileText, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiderInfo {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  email?: string;
}

const HRDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [riders, setRiders] = useState<RiderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRider, setSelectedRider] = useState<RiderInfo | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || profile?.role !== 'admin') {
          toast({
            title: "ไม่มีสิทธิ์เข้าถึง",
            description: "คุณไม่มีสิทธิ์เข้าถึงระบบ HR",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        fetchRiders();
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/');
      }
    };

    checkUserRole();
  }, [user, navigate, toast]);

  const fetchRiders = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rider')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRiders(profiles || []);
    } catch (error) {
      console.error('Error fetching riders:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลไรเดอร์ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter(rider =>
    rider.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.phone?.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ระบบจัดการ HR</h1>
              <p className="text-gray-600">จัดการข้อมูลไรเดอร์และพนักงาน</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              ไรเดอร์ทั้งหมด: {riders.length} คน
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              ค้นหาไรเดอร์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">ค้นหาด้วย ชื่อ, ชื่อผู้ใช้, หรือเบอร์โทร</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="พิมพ์เพื่อค้นหา..."
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchRiders} variant="outline">
                  รีเฟรช
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Riders Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อไรเดอร์</CardTitle>
            <CardDescription>
              ข้อมูลไรเดอร์ทั้งหมดที่สมัครใช้งานระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRiders.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'ไม่พบไรเดอร์ที่ค้นหา' : 'ยังไม่มีไรเดอร์สมัครใช้งาน'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ข้อมูลส่วนตัว</TableHead>
                      <TableHead>ชื่อผู้ใช้</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>ที่อยู่</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRiders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{rider.full_name || 'ไม่ระบุ'}</p>
                              <p className="text-sm text-gray-500">ID: {rider.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rider.username || 'ไม่ระบุ'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {rider.phone || 'ไม่ระบุ'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm line-clamp-2">
                              {rider.address || 'ไม่ระบุ'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(rider.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => setSelectedRider(rider)}
                            variant="outline"
                            size="sm"
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            ดูรายละเอียด
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rider Detail Modal */}
        {selectedRider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>รายละเอียดไรเดอร์</span>
                  <Button
                    onClick={() => setSelectedRider(null)}
                    variant="outline"
                    size="sm"
                  >
                    ปิด
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</Label>
                    <p className="mt-1 text-lg">{selectedRider.full_name || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ชื่อผู้ใช้</Label>
                    <p className="mt-1 text-lg">{selectedRider.username || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</Label>
                    <p className="mt-1 text-lg">{selectedRider.phone || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">วันที่สมัคร</Label>
                    <p className="mt-1 text-lg">{formatDate(selectedRider.created_at)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">ที่อยู่</Label>
                  <p className="mt-1 text-lg whitespace-pre-wrap">
                    {selectedRider.address || 'ไม่ระบุ'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                    {selectedRider.id}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Badge variant="secondary">ไรเดอร์</Badge>
                    <Badge variant="outline">ใช้งานอยู่</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
