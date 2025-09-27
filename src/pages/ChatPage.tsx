import React, { useState, useEffect } from 'react';
import { MessageList } from '@/components/MessageList';
import { Composer } from '@/components/Composer';
import { ChatHeader } from '@/components/ChatHeader';
import { AuthModal } from '@/components/AuthModal';
import { PairingModal } from '@/components/PairingModal';
import { Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface Contact {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
  isTyping: boolean;
}

const ChatPage = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPaired, setIsPaired] = useState(false);
  const [isE2EEEnabled, setIsE2EEEnabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showPairingModal, setShowPairingModal] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! This is a secure messaging app with end-to-end encryption.',
      timestamp: new Date(Date.now() - 300000),
      isSent: false,
      status: 'read',
      type: 'text',
      isEncrypted: true
    },
    {
      id: '2',
      content: 'That sounds amazing! The interface looks really clean and modern.',
      timestamp: new Date(Date.now() - 240000),
      isSent: true,
      status: 'read',
      type: 'text',
      isEncrypted: true
    },
    {
      id: '3',
      content: 'All messages are encrypted locally before being sent. Your privacy is protected! 🔒',
      timestamp: new Date(Date.now() - 120000),
      isSent: false,
      status: 'read',
      type: 'text',
      isEncrypted: true
    }
  ]);

  const [contact] = useState<Contact>({
    id: '1',
    name: 'Alice',
    isOnline: true,
    isTyping: false
  });

  useEffect(() => {
    // Demo: Auto-authenticate after 2 seconds for demo purposes
    const timer = setTimeout(() => {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowPairingModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isPaired) {
      // Demo: Auto-pair after authentication
      const timer = setTimeout(() => {
        setIsPaired(true);
        setShowPairingModal(false);
        setIsE2EEEnabled(true);
        toast({
          title: "🔒 Secure Connection Established",
          description: "End-to-end encryption is now active. Your messages are protected.",
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isPaired, toast]);

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isSent: true,
      status: 'sending',
      type,
      isEncrypted: isE2EEEnabled
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message progression
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    }, 2000);
  };

  const toggleE2EE = () => {
    setIsE2EEEnabled(!isE2EEEnabled);
    toast({
      title: isE2EEEnabled ? "🔓 E2EE Disabled" : "🔒 E2EE Enabled",
      description: isE2EEEnabled 
        ? "Messages will be sent without encryption" 
        : "All new messages will be end-to-end encrypted",
    });
  };

  if (!isAuthenticated || !isPaired) {
    return (
      <div className="min-h-screen bg-gradient-chat flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Secure Messenger</h1>
            <p className="text-muted-foreground">End-to-end encrypted messaging</p>
          </div>

          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onAuthenticated={() => {
              setIsAuthenticated(true);
              setShowAuthModal(false);
              setShowPairingModal(true);
            }}
          />

          <PairingModal 
            isOpen={showPairingModal}
            onClose={() => setShowPairingModal(false)}
            onPaired={() => {
              setIsPaired(true);
              setShowPairingModal(false);
              setIsE2EEEnabled(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-chat flex flex-col max-w-4xl mx-auto">
      <ChatHeader 
        contact={contact} 
        isE2EEEnabled={isE2EEEnabled}
        onToggleE2EE={toggleE2EE}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList messages={messages} />
        <Composer onSendMessage={handleSendMessage} isE2EEEnabled={isE2EEEnabled} />
      </div>

      {isE2EEEnabled && (
        <div className="fixed top-4 right-4 bg-secure-background text-secure px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-card">
          <Shield className="w-4 h-4" />
          E2EE Active
        </div>
      )}
    </div>
  );
};

export default ChatPage;