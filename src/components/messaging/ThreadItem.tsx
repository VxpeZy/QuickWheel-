// src/components/messaging/ThreadItem.tsx
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, User, Store, Bike, HeadphonesIcon } from 'lucide-react';
import { MessageThread, UserType } from '@/utils/messagingService';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ThreadItemProps {
  thread: MessageThread;
  onClick: () => void;
}

export const ThreadItem = ({ thread, onClick }: ThreadItemProps) => {
  const { user } = useAuth();
  
  // Find the other participant (not the current user)
  const otherParticipant = thread.participants.find(
    (participant) => participant.id !== user?.id
  );

  const getTimeString = () => {
    const date = new Date(thread.lastMessageTimestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: false });
    } else {
      return format(date, 'MMM d');
    }
  };

  const getParticipantIcon = (type: UserType) => {
    switch (type) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'restaurant':
        return <Store className="h-4 w-4" />;
      case 'rider':
        return <Bike className="h-4 w-4" />;
      case 'support':
        return <HeadphonesIcon className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getParticipantColor = (type: UserType) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-500';
      case 'restaurant':
        return 'bg-green-100 text-green-500';
      case 'rider':
        return 'bg-orange-100 text-orange-500';
      case 'support':
        return 'bg-purple-100 text-purple-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const isUnread = thread.unreadCount > 0 && thread.lastMessageSenderId !== user?.id;

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
        isUnread ? 'bg-muted/20' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={getParticipantColor(otherParticipant?.type || 'system')}>
            {getParticipantIcon(otherParticipant?.type || 'system')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-sm truncate ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
              {otherParticipant?.name || 'Unknown'}
            </h4>
            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
              {getTimeString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground truncate">
              {thread.lastMessagePreview}
            </p>
            
            {isUnread && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

