import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Smile, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreatePostCardProps {
  className?: string;
  onPostCreated?: () => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ 
  className, 
  onPostCreated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    
    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: 'status'
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive"
        });
      } else {
        setContent('');
        onPostCreated?.();
        toast({
          title: "Success",
          description: "Post shared successfully!"
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <Card className={cn("border-0 shadow-card", className)}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.profile_photo_url} />
            <AvatarFallback className="bg-gradient-primary text-white">
              {profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] border-none resize-none text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 p-0 bg-transparent"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Smile className="w-4 h-4 mr-2" />
                  Emoji
                </Button>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </Button>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {content.length}/500
                </span>
                <Button 
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};