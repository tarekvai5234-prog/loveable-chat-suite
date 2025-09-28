import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, Shield, Edit3, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhotoModal } from './PhotoModal';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isSent: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  isEncrypted?: boolean;
  edited?: boolean;
  media_url?: string;
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
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

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

  const renderMessageContent = () => {
    if (message.type === 'image' && message.media_url) {
      return (
        <div className="relative">
          <img
            src={message.media_url}
            alt={message.content || 'Shared image'}
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsPhotoOpen(true)}
          />
          {message.content && (
            <p className="mt-2 text-sm">{message.content}</p>
          )}
        </div>
      );
    }
    
    if (message.type === 'file' && message.media_url) {
      return (
        <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Image className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message.content || 'File attachment'}</p>
            <a 
              href={message.media_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Download
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {message.content}
        {message.edited && (
          <span className="inline-flex items-center gap-1 ml-2 text-xs opacity-70">
            <Edit3 className="w-3 h-3" />
            edited
          </span>
        )}
      </div>
    );
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
            {renderMessageContent()}
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

      {/* Photo Modal */}
      {message.type === 'image' && message.media_url && (
        <PhotoModal
          src={message.media_url}
          alt={message.content || 'Shared image'}
          isOpen={isPhotoOpen}
          onClose={() => setIsPhotoOpen(false)}
        />
      )}
    </div>
  );
};