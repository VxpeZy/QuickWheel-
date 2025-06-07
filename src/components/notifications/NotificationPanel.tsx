// src/components/notifications/NotificationPanel.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/utils/notificationService';

interface NotificationPanelProps {
  onClose?: () => void;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      if (onClose) onClose();
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            title="Mark all as read"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            disabled={notifications.length === 0}
            title="Clear all notifications"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" disabled={unreadCount === 0}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 p-0">
          <NotificationList 
            notifications={filteredNotifications} 
            onNotificationClick={handleNotificationClick} 
          />
        </TabsContent>

        <TabsContent value="unread" className="flex-1 p-0">
          <NotificationList 
            notifications={filteredNotifications} 
            onNotificationClick={handleNotificationClick} 
          />
        </TabsContent>
      </Tabs>

      <div className="p-3 border-t text-center">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            navigate('/notification-settings');
            if (onClose) onClose();
          }}
        >
          Notification Settings
        </Button>
      </div>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationList = ({ notifications, onNotificationClick }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mb-2 opacity-20" />
        <p>No notifications to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick(notification)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

