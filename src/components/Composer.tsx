import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Paperclip, Image, Smile, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ComposerProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', file?: File) => void;
  isE2EEEnabled: boolean;
  replyTo?: { id: string; content: string } | null;
  editMessage?: { id: string; content: string } | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({ 
  onSendMessage, 
  isE2EEEnabled, 
  replyTo, 
  editMessage,
  onCancelReply,
  onCancelEdit 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set message content when editing
  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.content);
      textareaRef.current?.focus();
    }
  }, [editMessage]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Handle typing indicator
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      // Simulate stopping typing after 2 seconds of no input
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      onSendMessage('', isImage ? 'image' : 'file', file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {/* Reply/Edit Context */}
      {(replyTo || editMessage) && (
        <div className="px-4 pt-3 pb-2 border-b border-border/50 bg-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-primary mb-1">
                {editMessage ? 'Edit message' : 'Reply to'}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {editMessage ? editMessage.content : replyTo?.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={editMessage ? onCancelEdit : onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* File attachment */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
            >
              <Image className="w-5 h-5" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={cn(
                "min-h-[44px] max-h-32 resize-none pr-12 py-3",
                "border-border bg-background/50 backdrop-blur-sm",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground"
              )}
            />
            
            {/* Encryption indicator in input */}
            {isE2EEEnabled && (
              <div className="absolute right-3 top-3 text-secure">
                <Shield className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Emoji picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-10 w-10"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="end" side="top">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "h-10 w-10 p-0 transition-all duration-200",
              message.trim() 
                ? "bg-gradient-primary hover:shadow-glow scale-100" 
                : "bg-muted text-muted-foreground scale-95"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* E2EE status indicator */}
        {isE2EEEnabled && (
          <div className="mt-2 text-xs text-secure flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Messages are end-to-end encrypted
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};