import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageList } from '@/components/MessageList';
import { Composer } from '@/components/Composer';
import { ChatHeader } from '@/components/ChatHeader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  profile_photo_url: string;
}

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friend, setFriend] = useState<Profile | null>(null);
  const [isE2EEEnabled, setIsE2EEEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && friendId) {
      fetchFriend();
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, friendId]);

  const fetchFriend = async () => {
    if (!friendId) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', friendId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load friend profile",
        variant: "destructive"
      });
    } else {
      setFriend(data);
    }
  };

  const fetchMessages = async () => {
    if (!user || !friendId) return;
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data);
      // Mark messages as read
      markMessagesAsRead();
    }
    setLoading(false);
  };

  const markMessagesAsRead = async () => {
    if (!user || !friendId) return;
    
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', friendId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
  };

  const subscribeToMessages = () => {
    if (!user || !friendId) return;
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          // Mark as read if it's from the friend
          if (payload.new.sender_id === friendId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string) => {
    if (!user || !friendId || !content.trim()) return;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: friendId,
        content: content.trim(),
        message_type: 'text'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  // Transform messages for the MessageList component
  const transformedMessages = messages.map(msg => {
    // Validate created_at timestamp
    const timestamp = msg.created_at ? new Date(msg.created_at) : new Date();
    
    return {
      id: msg.id,
      content: msg.content,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      isSent: msg.sender_id === user?.id,
      status: (msg.is_read ? 'read' : 'delivered') as 'sent' | 'delivered' | 'read',
      type: 'text' as const
    };
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!friend) {
    return <div className="flex items-center justify-center h-screen">Friend not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <ChatHeader 
        contact={{ id: friendId!, name: friend?.display_name || friend?.username || 'Friend', isOnline: true, isTyping: false }}
        isE2EEEnabled={isE2EEEnabled}
        onToggleE2EE={() => setIsE2EEEnabled(!isE2EEEnabled)}
      />
      <MessageList messages={transformedMessages} />
      <Composer onSendMessage={handleSendMessage} isE2EEEnabled={isE2EEEnabled} />
    </div>
  );
}