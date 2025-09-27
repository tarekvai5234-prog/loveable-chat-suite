import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Copy, QrCode, Users, Link2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaired: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({ isOpen, onClose, onPaired }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState('');
  const [step, setStep] = useState<'method' | 'generate' | 'enter' | 'connecting'>('method');

  // Generate a demo invite code
  useEffect(() => {
    if (step === 'generate') {
      const code = 'SECURE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      setGeneratedInvite(code);
    }
  }, [step]);

  const handleGenerateInvite = () => {
    setStep('generate');
    toast({
      title: "Invite Generated",
      description: "Share this code with your contact to establish a secure connection.",
    });
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(generatedInvite);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually.",
        variant: "destructive"
      });
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    setStep('connecting');
    
    // Simulate pairing process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "🔒 Secure Connection Established",
        description: "End-to-end encryption keys have been exchanged successfully.",
      });
      onPaired();
    }, 3000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect with Someone</h3>
        <p className="text-muted-foreground text-sm">
          Choose how you'd like to establish a secure connection
        </p>
      </div>

      <div className="grid gap-4">
        <Button
          onClick={handleGenerateInvite}
          variant="outline"
          className="h-auto p-4 flex-col gap-2 border-2 hover:border-primary/50"
        >
          <Link2 className="w-6 h-6 text-primary" />
          <div className="text-center">
            <div className="font-medium">Generate Invite</div>
            <div className="text-xs text-muted-foreground">Create a secure invite code</div>
          </div>
        </Button>

        <Button
          onClick={() => setStep('enter')}
          variant="outline"
          className="h-auto p-4 flex-col gap-2 border-2 hover:border-primary/50"
        >
          <QrCode className="w-6 h-6 text-primary" />
          <div className="text-center">
            <div className="font-medium">Join with Code</div>
            <div className="text-xs text-muted-foreground">Enter an invite code you received</div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderGenerateInvite = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-secure mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Invite Generated</h3>
        <p className="text-muted-foreground text-sm">
          Share this code with your contact to connect securely
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-secure-background p-4 rounded-lg border-2 border-secure/20">
          <Label className="text-xs font-medium text-secure mb-2 block">
            SECURE INVITE CODE
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-lg font-mono font-bold text-center py-2 bg-background rounded border">
              {generatedInvite}
            </code>
            <Button
              onClick={handleCopyInvite}
              size="icon"
              variant="outline"
              className="border-secure/20 hover:bg-secure/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-warning-background p-3 rounded-lg border border-warning/20">
          <p className="text-warning text-xs font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Only share this code through a secure channel
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => {
            // Simulate auto-pairing for demo
            setTimeout(onPaired, 1000);
          }}
          className="flex-1 bg-gradient-primary hover:shadow-glow"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderEnterCode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Enter Invite Code</h3>
        <p className="text-muted-foreground text-sm">
          Enter the secure invite code you received
        </p>
      </div>

      <form onSubmit={handleAcceptInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-code">Invite Code</Label>
          <Input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="SECURE-XXXXXXXX"
            className="text-center font-mono text-lg"
            required
          />
        </div>

        <div className="bg-secure-background p-3 rounded-lg border border-secure/20">
          <p className="text-secure text-xs font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            This will establish end-to-end encryption keys
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('method')} 
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-primary hover:shadow-glow"
            disabled={!inviteCode.trim() || isLoading}
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderConnecting = () => (
    <div className="space-y-6 text-center py-8">
      <div className="animate-pulse">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Establishing Secure Connection</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Exchanging encryption keys...
        </p>
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'method': return renderMethodSelection();
      case 'generate': return renderGenerateInvite();
      case 'enter': return renderEnterCode();
      case 'connecting': return renderConnecting();
      default: return renderMethodSelection();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={step !== 'connecting' ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Secure Pairing</DialogTitle>
        </DialogHeader>
        
        {getStepContent()}
      </DialogContent>
    </Dialog>
  );
};