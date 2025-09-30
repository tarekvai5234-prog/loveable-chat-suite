import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image, Smile, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComposerProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', file?: File) => void;
  isE2EEEnabled: boolean;
}

export const Composer: React.FC<ComposerProps> = ({ onSendMessage, isE2EEEnabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
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
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <Smile className="w-5 h-5" />
          </Button>

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