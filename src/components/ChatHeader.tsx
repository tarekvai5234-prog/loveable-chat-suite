import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, ShieldOff, MoreVertical, Phone, Video, ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Contact {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
  isTyping: boolean;
}

interface ChatHeaderProps {
  contact: Contact;
  isE2EEEnabled: boolean;
  onToggleE2EE: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  contact, 
  isE2EEEnabled, 
  onToggleE2EE 
}) => {
  const navigate = useNavigate();
  
  const getStatusText = () => {
    if (contact.isTyping) return 'typing...';
    if (contact.isOnline) return 'online';
    if (contact.lastSeen) return `last seen ${format(contact.lastSeen, 'HH:mm')}`;
    return 'offline';
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Home button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <Home className="w-5 h-5" />
          </Button>

          {/* Avatar with online status */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                {contact.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Online indicator */}
            <div 
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                contact.isOnline ? "bg-online" : "bg-offline"
              )}
            />
          </div>

          {/* Contact info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {contact.name}
            </h2>
            <p className={cn(
              "text-sm truncate transition-colors duration-200",
              contact.isTyping 
                ? "text-typing font-medium" 
                : "text-muted-foreground"
            )}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* E2EE Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleE2EE}
            className={cn(
              "h-10 w-10 transition-all duration-200",
              isE2EEEnabled 
                ? "text-secure hover:bg-secure-background" 
                : "text-muted-foreground hover:bg-warning-background hover:text-warning"
            )}
            title={`${isE2EEEnabled ? 'Disable' : 'Enable'} End-to-End Encryption`}
          >
            {isE2EEEnabled ? (
              <Shield className="w-5 h-5" />
            ) : (
              <ShieldOff className="w-5 h-5" />
            )}
          </Button>

          {/* Voice call */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <Phone className="w-5 h-5" />
          </Button>

          {/* Video call */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <Video className="w-5 h-5" />
          </Button>

          {/* More options */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* E2EE Status Banner */}
      {isE2EEEnabled && (
        <div className="mt-3 flex items-center justify-center">
          <div className="bg-secure-background text-secure px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <Shield className="w-3 h-3" />
            End-to-end encrypted conversation
          </div>
        </div>
      )}
    </header>
  );
};