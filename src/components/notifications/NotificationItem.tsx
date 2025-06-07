// src/components/notifications/NotificationItem.tsx
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, Trash2, ShoppingBag, MessageSquare, Bell, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/utils/notificationService';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const { markAsRead, removeNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'order_update':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeString = () => {
    const date = new Date(notification.timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
        !notification.isRead ? 'bg-muted/20' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getNotificationIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getTimeString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.content}
          </p>
          
          {isHovered && (
            <div className="flex justify-end mt-2 gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDelete}
                title="Delete notification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

