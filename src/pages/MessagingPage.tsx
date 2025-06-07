// src/pages/MessagingPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { ThreadItem } from '@/components/messaging/ThreadItem';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { NewMessageForm } from '@/components/messaging/NewMessageForm';
import { useAuth } from '@/hooks/useAuth';

const MessagingPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const {
    threads,
    activeThread,
    activeThreadMessages,
    loadThread,
    sendMessage,
    removeThread,
    markAsRead
  } = useMessaging();
  
  const [messageText, setMessageText] = useState('');
  const [showNewMessageForm, setShowNewMessageForm] = useState(threadId === 'new');

  useEffect(() => {
    if (threadId && threadId !== 'new') {
      loadThread(threadId);
      markAsRead(threadId);
    }
  }, [threadId, loadThread, markAsRead]);

  useEffect(() => {
    setShowNewMessageForm(threadId === 'new');
  }, [threadId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeThread) return;
    
    sendMessage(messageText);
    setMessageText('');
  };

  const handleDeleteThread = () => {
    if (!activeThread) return;
    
    removeThread(activeThread.id);
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Thread List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Conversations</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/messages/new')}
                title="New message"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="divide-y">
                {threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    onClick={() => navigate(`/messages/${thread.id}`)}
                  />
                ))}
                
                {threads.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No conversations yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/messages/new')}
                    >
                      Start a conversation
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message Area */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border md:col-span-2">
            {showNewMessageForm ? (
              <NewMessageForm onCancel={() => navigate('/messages')} />
            ) : activeThread ? (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h2 className="font-semibold">
                      {activeThread.participants.find(p => p.id !== user?.id)?.name || 'Conversation'}
                    </h2>
                    {activeThread.subject && (
                      <p className="text-sm text-muted-foreground">{activeThread.subject}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteThread}
                    title="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-350px)] p-4">
                  <div className="space-y-4">
                    {activeThreadMessages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === user?.id}
                      />
                    ))}
                    
                    {activeThreadMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation by sending a message</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                <p>Select a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;

