// src/components/messaging/NewMessageForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { UserType } from '@/utils/messagingService';

interface NewMessageFormProps {
  onCancel: () => void;
}

interface RecipientOption {
  id: string;
  name: string;
  type: UserType;
}

export const NewMessageForm = ({ onCancel }: NewMessageFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createThread } = useMessaging();
  
  const [recipientType, setRecipientType] = useState<UserType>('customer');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  
  // Generate sample recipients based on user type
  useEffect(() => {
    if (!user?.id) return;
    
    const userType = user.user_metadata?.role as UserType || 'customer';
    const sampleRecipients: RecipientOption[] = [];
    
    if (userType === 'customer') {
      // Customers can message restaurants and support
      sampleRecipients.push(
        { id: 'restaurant-123', name: 'Bangkok Bistro', type: 'restaurant' },
        { id: 'restaurant-456', name: 'Thai Spice Kitchen', type: 'restaurant' },
        { id: 'restaurant-789', name: 'Siam Delight', type: 'restaurant' },
        { id: 'support-123', name: 'Quick Wheel Support', type: 'support' }
      );
    } else if (userType === 'restaurant') {
      // Restaurants can message customers and support
      sampleRecipients.push(
        { id: 'customer-123', name: 'Somchai T.', type: 'customer' },
        { id: 'customer-456', name: 'Nattapong S.', type: 'customer' },
        { id: 'customer-789', name: 'Supaporn P.', type: 'customer' },
        { id: 'support-123', name: 'Quick Wheel Support', type: 'support' }
      );
    } else if (userType === 'rider') {
      // Riders can message customers, restaurants, and support
      sampleRecipients.push(
        { id: 'customer-123', name: 'Somchai T.', type: 'customer' },
        { id: 'customer-456', name: 'Nattapong S.', type: 'customer' },
        { id: 'restaurant-123', name: 'Bangkok Bistro', type: 'restaurant' },
        { id: 'restaurant-456', name: 'Thai Spice Kitchen', type: 'restaurant' },
        { id: 'support-123', name: 'Quick Wheel Support', type: 'support' }
      );
    }
    
    setRecipients(sampleRecipients);
    
    // Set default recipient type
    if (sampleRecipients.length > 0) {
      setRecipientType(sampleRecipients[0].type);
    }
  }, [user?.id]);
  
  const filteredRecipients = recipients.filter(r => r.type === recipientType);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !recipientId) return;
    
    const selectedRecipient = recipients.find(r => r.id === recipientId);
    if (!selectedRecipient) return;
    
    const result = createThread(
      selectedRecipient.id,
      selectedRecipient.type,
      selectedRecipient.name,
      message,
      { subject: subject || undefined }
    );
    
    if (result?.thread) {
      navigate(`/messages/${result.thread.id}`);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">New Message</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="recipient-type">Recipient Type</Label>
            <Select
              value={recipientType}
              onValueChange={(value) => {
                setRecipientType(value as UserType);
                setRecipientId(''); // Reset recipient when type changes
              }}
            >
              <SelectTrigger id="recipient-type">
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(recipients.map(r => r.type))).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Select
              value={recipientId}
              onValueChange={setRecipientId}
              disabled={filteredRecipients.length === 0}
            >
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {filteredRecipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 flex-1">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] flex-1"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!message.trim() || !recipientId}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

