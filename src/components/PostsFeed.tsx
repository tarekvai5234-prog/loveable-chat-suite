import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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
  profile?: {
    user_id: string;
    username: string;
    display_name: string;
    profile_photo_url: string;
  };
}

interface PostsFeedProps {
  className?: string;
}

export const PostsFeed: React.FC<PostsFeedProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeedPosts();
    }
  }, [user]);

  const fetchFeedPosts = async () => {
    if (!user) return;
    
    try {
      // First get friends
      const { data: friends } = await supabase
        .from('friends')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds = friends?.map(friendship => 
        friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id
      ) || [];

      // Include user's own posts
      const userIds = [user.id, ...friendIds];

      // Fetch posts from friends and self
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .in('user_id', userIds)
        .eq('post_type', 'status')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (postsData) {
        // Fetch profiles separately
        const profileIds = [...new Set(postsData.map(post => post.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, profile_photo_url')
          .in('user_id', profileIds);

        // Combine posts with profiles
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profile: profilesData?.find(profile => profile.user_id === post.user_id)
        }));
        
        setPosts(postsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No posts yet</h3>
              <p className="text-sm">Connect with friends to see their posts here!</p>
            </div>
            <Button onClick={() => navigate('/friends')} className="bg-gradient-primary hover:shadow-glow">
              Find Friends
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {posts.map((post) => (
        <Card key={post.id} className="border-0 shadow-card hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleProfileClick(post.user_id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.profile?.profile_photo_url} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {post.profile?.display_name?.charAt(0) || post.profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{post.profile?.display_name || post.profile?.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{post.profile?.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-foreground leading-relaxed">{post.content}</p>
              {post.image_url && (
                <div className="mt-4">
                  <img 
                    src={post.image_url} 
                    alt="Post media" 
                    className="rounded-lg max-w-full h-auto border border-border/50" 
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="text-sm">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="text-sm">Comment</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20">
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
              
              {post.user_id !== user?.id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessageClick(post.user_id)}
                  className="text-primary border-primary/20 hover:bg-primary/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};