
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RiderDashboard from './RiderDashboard';
import RiderRegistrationForm from '@/components/rider/RiderRegistrationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const SecureRiderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole(null);
        } else {
          setUserRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      } finally {
        setProfileLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Show loading while checking authentication
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ต้องเข้าสู่ระบบ
            </h2>
            <p className="text-gray-600 mb-6">
              คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้าไรเดอร์
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                เข้าสู่ระบบ
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration form if user is not a rider
  if (userRole !== 'rider') {
    return <RiderRegistrationForm />;
  }

  // Show rider dashboard if user is a rider
  return <RiderDashboard />;
};

export default SecureRiderDashboard;
