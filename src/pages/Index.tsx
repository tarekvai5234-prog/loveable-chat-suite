import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MessageCircle, Key, Users, User, UserPlus } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their profile
    if (isAuthenticated && user) {
      navigate('/profile');
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuthenticated = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Social Messenger
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with friends, share moments, and chat securely. Build your social network and stay connected with end-to-end encryption.
            </p>
          </div>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
                onClick={() => setShowAuthModal(true)}
              >
                <Shield className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-primary font-medium">Welcome back!</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-5 w-5" />
                  My Profile
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/friends')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Find Friends
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Social Network</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Build your network by finding and adding friends. Share posts, highlights, and stay connected with your social circle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Instant messaging with friends including text, images, and media. See when messages are delivered and read.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Optional end-to-end encryption ensures your conversations stay private. Your data is secure and protected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}