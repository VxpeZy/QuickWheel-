// src/components/messaging/MessagingIcon.tsx
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessaging } from '@/hooks/useMessaging';
import { MessagingPanel } from './MessagingPanel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessagingIconProps {
  className?: string;
}

export const MessagingIcon = ({ className }: MessagingIconProps) => {
  const { unreadCount } = useMessaging();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label="Messages"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-500 text-[10px] font-medium text-white flex items-center justify-center translate-x-1/3 -translate-y-1/3">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <MessagingPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

