import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, MessageCircle, Users, Search, UserPlus, Settings, Bell } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PostsFeed } from '@/components/PostsFeed';
import { CreatePostCard } from '@/components/CreatePostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleAuthenticated = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/friends?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const refreshFeed = () => {
    // This will trigger a re-render of PostsFeed component
    window.location.reload();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
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
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Social Network</h3>
                <p className="text-muted-foreground text-sm">
                  Build your network by finding and adding friends. Share posts, highlights, and stay connected with your social circle.
                </p>
              </div>
            </Card>

            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Chat</h3>
                <p className="text-muted-foreground text-sm">
                  Instant messaging with friends including text, images, and media. See when messages are delivered and read.
                </p>
              </div>
            </Card>

            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Privacy First</h3>
                <p className="text-muted-foreground text-sm">
                  Optional end-to-end encryption ensures your conversations stay private. Your data is secure and protected.
                </p>
              </div>
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

  // Main home page for authenticated users
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Social
              </h1>
            </div>
          </div>

          {/* Search Bar - Responsive */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search friends, posts, or anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 bg-muted/50 border-0 focus:bg-background"
              />
            </div>
          </div>

          {/* Mobile Search Button */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={handleSearch}>
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Navigation - Responsive */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden md:flex">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/friends')} className="hidden sm:flex">
              <UserPlus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hidden sm:flex">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar 
              className="h-8 w-8 cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <AvatarImage src={profile?.profile_photo_url} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24 lg:pb-6">
        <div className="space-y-6">
          {/* Create Post Card - Only for authenticated users */}
          <CreatePostCard onPostCreated={refreshFeed} />
          
          {/* Posts Feed */}
          <PostsFeed />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on larger screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 px-4 py-2 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="flex flex-col gap-1 h-auto py-2">
            <Shield className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/friends')} className="flex flex-col gap-1 h-auto py-2">
            <Users className="w-5 h-5" />
            <span className="text-xs">Friends</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSearch} className="flex flex-col gap-1 h-auto py-2">
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="flex flex-col gap-1 h-auto py-2">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>

      {/* Padding for mobile bottom nav */}
      <div className="lg:hidden h-20" />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}