
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { User, ShieldCheck, Users, Bike } from 'lucide-react';

const AuthForm = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'rider'>('customer');
  
  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    adminCode: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateSignUp = () => {
    const newErrors: { [key: string]: string } = {};

    if (!signUpData.email) newErrors.email = 'กรุณากรอกอีเมล';
    if (!signUpData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (signUpData.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }
    if (!signUpData.username) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    if (!signUpData.fullName) newErrors.fullName = 'กรุณากรอกชื่อเต็ม';
    if (userRole === 'admin' && !signUpData.adminCode) {
      newErrors.adminCode = 'กรุณากรอกรหัสผู้ดูแลระบบ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(signInData.email, signInData.password);
    if (!error) {
      // Redirect will be handled by auth state change
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;

    const { error } = await signUp(signUpData.email, signUpData.password, {
      username: signUpData.username,
      full_name: signUpData.fullName,
      role: userRole,
      adminCode: userRole === 'admin' ? signUpData.adminCode : undefined
    });
    
    if (!error) {
      setIsSignUp(false);
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        fullName: '',
        adminCode: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ยินดีต้อนรับสู่ Quick Wheel</CardTitle>
          <CardDescription>
            {isSignUp ? 'สร้างบัญชีของคุณ' : 'เข้าสู่ระบบบัญชีของคุณ'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                เข้าสู่ระบบ
              </TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                สมัครสมาชิก
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">อีเมล</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">รหัสผ่าน</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>ประเภทบัญชี</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={userRole === 'customer' ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                      onClick={() => setUserRole('customer')}
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-xs">ลูกค้า</span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant={userRole === 'rider' ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                      onClick={() => setUserRole('rider')}
                    >
                      <Bike className="h-4 w-4" />
                      <span className="text-xs">ไรเดอร์</span>
                    </Button>
                    
                    <Button
                      type="button"
                      variant={userRole === 'admin' ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col items-center gap-1"
                      onClick={() => setUserRole('admin')}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs">ผู้ดูแล</span>
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">ชื่อผู้ใช้</Label>
                      <Input
                        id="username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        className={errors.username ? 'border-red-500' : ''}
                      />
                      {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ชื่อเต็ม</Label>
                      <Input
                        id="fullName"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">อีเมล</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">รหัสผ่าน</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  {userRole === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="admin-code">รหัสผู้ดูแลระบบ</Label>
                      <Input
                        id="admin-code"
                        type="password"
                        placeholder="กรอกรหัสยืนยันผู้ดูแลระบบ"
                        value={signUpData.adminCode}
                        onChange={(e) => setSignUpData({ ...signUpData, adminCode: e.target.value })}
                        className={errors.adminCode ? 'border-red-500' : ''}
                      />
                      {errors.adminCode && <p className="text-sm text-red-500">{errors.adminCode}</p>}
                      <p className="text-xs text-gray-500">
                        ติดต่อผู้ดูแลระบบเพื่อขอรหัสผู้ดูแลระบบ
                      </p>
                    </div>
                  )}

                  {userRole === 'rider' && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        หลังจากสมัครสมาชิกแล้ว คุณจะต้องกรอกข้อมูลเพิ่มเติมเพื่อเป็นไรเดอร์
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'กำลังสร้างบัญชี...' : `สร้างบัญชี${userRole === 'admin' ? 'ผู้ดูแลระบบ' : userRole === 'rider' ? 'ไรเดอร์' : 'ลูกค้า'}`}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
