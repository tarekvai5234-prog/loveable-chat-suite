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
  media_url?: string;
  message_type: string;
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
  const [optimisticMessages, setOptimisticMessages] = useState<string[]>([]);

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
      .channel(`messages:${user.id}:${friendId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('Real-time message received:', newMessage);
          
          // Remove from optimistic messages if it exists
          setOptimisticMessages(prev => prev.filter(id => id !== newMessage.id));
          
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(msg => msg.id === newMessage.id)) {
              return prev;
            }
            const updatedMessages = [...prev, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            return updatedMessages;
          });
          
          // Auto mark as read if it's from the friend
          if (newMessage.sender_id === friendId) {
            setTimeout(() => markMessagesAsRead(), 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          console.log('Real-time message updated:', updatedMessage);
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', file?: File) => {
    if (!user || !friendId) return;
    if (!content.trim() && !file) return;
    
    let mediaUrl: string | undefined;
    
    // Upload file if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${friendId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('messages')
        .upload(fileName, file);
      
      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive"
        });
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(fileName);
      
      mediaUrl = publicUrl;
    }
    
    // Create optimistic message
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      content: content.trim() || (file ? file.name : ''),
      sender_id: user.id,
      recipient_id: friendId,
      created_at: new Date().toISOString(),
      is_read: false,
      media_url: mediaUrl,
      message_type: type
    };
    
    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setOptimisticMessages(prev => [...prev, optimisticId]);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: friendId,
          content: content.trim() || (file ? file.name : ''),
          message_type: type,
          media_url: mediaUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      // Replace optimistic message with real one
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticId ? data : msg
        ));
        setOptimisticMessages(prev => prev.filter(id => id !== optimisticId));
      }
    } catch (error) {
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      setOptimisticMessages(prev => prev.filter(id => id !== optimisticId));
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = (content: string, type?: 'text' | 'image' | 'file', file?: File) => {
    sendMessage(content, type, file);
  };

  // Transform messages for the MessageList component
  const transformedMessages = messages.map(msg => {
    // Validate created_at timestamp
    const timestamp = msg.created_at ? new Date(msg.created_at) : new Date();
    const isOptimistic = optimisticMessages.includes(msg.id);
    
    return {
      id: msg.id,
      content: msg.content,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      isSent: msg.sender_id === user?.id,
      status: isOptimistic ? 'sending' as const : (msg.is_read ? 'read' : 'delivered') as 'sent' | 'delivered' | 'read',
      type: (msg.message_type || 'text') as 'text' | 'image' | 'file',
      media_url: msg.media_url
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