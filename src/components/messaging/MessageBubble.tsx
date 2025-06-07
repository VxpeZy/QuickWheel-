// src/components/messaging/MessageBubble.tsx
import { format } from 'date-fns';
import { Message } from '@/utils/messagingService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Store, Bike, HeadphonesIcon, MessageSquare } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  const getTimeString = () => {
    const date = new Date(message.timestamp);
    return format(date, 'h:mm a');
  };

  const getSenderIcon = () => {
    switch (message.senderType) {
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

  const getSenderColor = () => {
    switch (message.senderType) {
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

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarFallback className={getSenderColor()}>
              {getSenderIcon()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isCurrentUser ? 'items-end mr-2' : 'items-start'}`}>
          <div
            className={`rounded-lg p-3 ${
              isCurrentUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="text-xs underline">
                    {attachment.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center mt-1 space-x-1">
            <span className="text-xs text-muted-foreground">
              {getTimeString()}
            </span>
            
            {isCurrentUser && message.isRead && (
              <span className="text-xs text-muted-foreground">• Read</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

