import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, Shield, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isFirstInGroup, 
  isLastInGroup 
}) => {
  const renderStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="w-4 h-4 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-delivered" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-read" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full",
        message.isSent ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] group relative",
          message.isSent ? "ml-12" : "mr-12"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 text-sm font-medium transition-all duration-200",
            "relative overflow-hidden",
            // Sent messages
            message.isSent && [
              "bg-gradient-message text-message-sent-foreground shadow-message",
              isFirstInGroup && isLastInGroup && "rounded-2xl",
              isFirstInGroup && !isLastInGroup && "rounded-2xl rounded-br-md",
              !isFirstInGroup && isLastInGroup && "rounded-2xl rounded-tr-md",
              !isFirstInGroup && !isLastInGroup && "rounded-2xl rounded-tr-md rounded-br-md"
            ],
            // Received messages
            !message.isSent && [
              "bg-message-received text-message-received-foreground shadow-sm border border-border/50",
              isFirstInGroup && isLastInGroup && "rounded-2xl",
              isFirstInGroup && !isLastInGroup && "rounded-2xl rounded-bl-md",
              !isFirstInGroup && isLastInGroup && "rounded-2xl rounded-tl-md",
              !isFirstInGroup && !isLastInGroup && "rounded-2xl rounded-tl-md rounded-bl-md"
            ]
          )}
        >
          {/* Message content */}
          <div className="relative z-10">
            {message.content}
            
            {message.edited && (
              <span className="inline-flex items-center gap-1 ml-2 text-xs opacity-70">
                <Edit3 className="w-3 h-3" />
                edited
              </span>
            )}
          </div>

          {/* Encryption indicator */}
          {message.isEncrypted && (
            <div className="absolute top-2 right-2 opacity-60">
              <Shield className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Timestamp and status */}
        {isLastInGroup && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
              message.isSent ? "justify-end" : "justify-start"
            )}
          >
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {message.isSent && renderStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
};