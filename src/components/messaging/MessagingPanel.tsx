// src/components/messaging/MessagingPanel.tsx
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { ThreadItem } from './ThreadItem';

interface MessagingPanelProps {
  onClose?: () => void;
}

export const MessagingPanel = ({ onClose }: MessagingPanelProps) => {
  const navigate = useNavigate();
  const { threads, loadThread } = useMessaging();

  const handleThreadClick = (threadId: string) => {
    navigate(`/messages/${threadId}`);
    if (onClose) onClose();
  };

  const handleNewMessage = () => {
    navigate('/messages/new');
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Messages</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewMessage}
          title="New message"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
          <p>No messages to display</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleNewMessage}
          >
            Start a conversation
          </Button>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="p-3 border-t text-center">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            navigate('/messages');
            if (onClose) onClose();
          }}
        >
          View All Messages
        </Button>
      </div>
    </div>
  );
};

