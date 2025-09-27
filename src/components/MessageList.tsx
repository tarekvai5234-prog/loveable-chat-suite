import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isSent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  isEncrypted?: boolean;
  edited?: boolean;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = format(message.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([dateKey, msgs]) => ({
      date: new Date(dateKey),
      messages: msgs
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messageGroups.map(({ date, messages: groupMessages }) => (
        <div key={format(date, 'yyyy-MM-dd')} className="space-y-4">
          {/* Date Header */}
          <div className="flex justify-center">
            <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
              {formatDateHeader(date)}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {groupMessages.map((message, index) => {
              const prevMessage = index > 0 ? groupMessages[index - 1] : null;
              const nextMessage = index < groupMessages.length - 1 ? groupMessages[index + 1] : null;
              
              const isFirstInGroup = !prevMessage || prevMessage.isSent !== message.isSent;
              const isLastInGroup = !nextMessage || nextMessage.isSent !== message.isSent;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};