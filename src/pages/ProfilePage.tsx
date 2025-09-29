import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, MessageCircle, Settings, Plus, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  profile_photo_url: string;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  post_type: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  updated_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [highlights, setHighlights] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', type: 'status' });
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'sent'>('none');
  
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPosts();
      if (!isOwnProfile) {
        checkFriendshipStatus();
      }
    }
  }, [user, userId]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data.filter(post => post.post_type === 'status'));
      setHighlights(data.filter(post => post.post_type === 'highlight'));
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user || !userId) return;
    
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
      .single();

    if (error) {
      setFriendshipStatus('none');
    } else {
      if (data.status === 'accepted') {
        setFriendshipStatus('accepted');
      } else if (data.requester_id === user.id) {
        setFriendshipStatus('sent');
      } else {
        setFriendshipStatus('pending');
      }
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !userId) return;
    
    const { error } = await supabase
      .from('friends')
      .insert({
        requester_id: user.id,
        addressee_id: userId,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Friend request sent!"
      });
      setFriendshipStatus('sent');
    }
  };

  const startChat = () => {
    if (userId) {
      navigate(`/chat/${userId}`);
    }
  };

  const updateProfile = async (updatedData: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      fetchProfile();
      setIsEditing(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.content.trim()) return;
    
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPost.content,
        post_type: newPost.type
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } else {
      setNewPost({ content: '', type: 'status' });
      fetchPosts();
      toast({
        title: "Success",
        description: "Post created successfully"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-screen">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <div className="p-4">
        <Navigation />
      </div>
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-primary rounded-t-2xl overflow-hidden">
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute top-4 right-4"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Settings className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          </Button>
        </div>

        {/* Profile Info */}
        <Card className="relative -mt-16 mx-4 shadow-elegant">
          <CardContent className="pt-20 pb-6">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center space-y-2">
              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <Input
                    value={profile.display_name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                    placeholder="Display name"
                  />
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                    placeholder="Bio"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => updateProfile(profile)}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  {profile.bio && <p className="text-sm max-w-md mx-auto">{profile.bio}</p>}
                </>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              {isOwnProfile ? (
                <Button className="bg-gradient-primary hover:shadow-glow" onClick={() => navigate('/friends')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              ) : (
                <>
                  {friendshipStatus === 'accepted' && (
                    <Button className="bg-gradient-primary hover:shadow-glow" onClick={startChat}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  )}
                  {friendshipStatus === 'none' && (
                    <Button variant="outline" onClick={sendFriendRequest}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                  )}
                  {friendshipStatus === 'sent' && (
                    <Button variant="outline" disabled>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  )}
                  {friendshipStatus === 'pending' && (
                    <Button variant="outline" disabled>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Request Pending
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Highlights Section */}
        {highlights.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {highlights.map((highlight) => (
                  <div 
                    key={highlight.id} 
                    className="flex-shrink-0 w-20 h-20 bg-gradient-primary rounded-full p-1"
                  >
                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                      {highlight.image_url ? (
                        <img 
                          src={highlight.image_url} 
                          alt="Highlight" 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        <span className="text-xs text-center">{highlight.content.slice(0, 10)}</span>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="flex-shrink-0 w-20 h-20 rounded-full"
                  onClick={() => setNewPost({ ...newPost, type: 'highlight' })}
                >
                   <Plus className="h-6 w-6" />
                 </Button>
               </div>
           </CardContent>
         </Card>
        )}

        {/* Create Post - Only show for own profile */}
        {isOwnProfile && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback>
                  {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      variant={newPost.type === 'status' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setNewPost({ ...newPost, type: 'status' })}
                    >
                      Post
                    </Button>
                    <Button 
                      variant={newPost.type === 'highlight' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setNewPost({ ...newPost, type: 'highlight' })}
                    >
                      Highlight
                    </Button>
                  </div>
                  <Button onClick={createPost} disabled={!newPost.content.trim()}>
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Posts */}
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={profile.profile_photo_url} />
                    <AvatarFallback>
                      {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{profile.display_name}</span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mb-4">{post.content}</p>
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        alt="Post media" 
                        className="rounded-lg max-w-full h-auto mb-4" 
                      />
                    )}
                    <div className="flex gap-4 text-muted-foreground">
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}