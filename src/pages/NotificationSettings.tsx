// src/pages/NotificationSettings.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Globe, ShoppingBag, MessageSquare, Gift, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { preferences, loading, togglePreference } = useNotificationPreferences();

  if (loading || !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center mb-8">
            <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="in-app-notifications" className="font-medium">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications within the app
                  </p>
                </div>
              </div>
              <Switch
                id="in-app-notifications"
                checked={preferences.inAppEnabled}
                onCheckedChange={() => togglePreference('inAppEnabled')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="browser-notifications" className="font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                id="browser-notifications"
                checked={preferences.browserEnabled}
                onCheckedChange={() => togglePreference('browserEnabled')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailEnabled}
                onCheckedChange={() => togglePreference('emailEnabled')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="order-updates" className="font-medium">
                    Order Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about your orders
                  </p>
                </div>
              </div>
              <Switch
                id="order-updates"
                checked={preferences.orderUpdates}
                onCheckedChange={() => togglePreference('orderUpdates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="messages" className="font-medium">
                    Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about new messages
                  </p>
                </div>
              </div>
              <Switch
                id="messages"
                checked={preferences.messages}
                onCheckedChange={() => togglePreference('messages')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Gift className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="promotions" className="font-medium">
                    Promotions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about promotions and offers
                  </p>
                </div>
              </div>
              <Switch
                id="promotions"
                checked={preferences.promotions}
                onCheckedChange={() => togglePreference('promotions')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Info className="h-5 w-5 text-orange-500" />
                <div>
                  <Label htmlFor="system-updates" className="font-medium">
                    System Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about system updates and announcements
                  </p>
                </div>
              </div>
              <Switch
                id="system-updates"
                checked={preferences.systemUpdates}
                onCheckedChange={() => togglePreference('systemUpdates')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;

