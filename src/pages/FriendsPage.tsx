import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  profile_photo_url: string;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } else {
      setSearchResults(data);
    }
    setLoading(false);
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        created_at,
        updated_at
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
    } else {
      // Get friend user IDs
      const friendUserIds = data.map(friendship => {
        return friendship.requester_id === user.id 
          ? friendship.addressee_id 
          : friendship.requester_id;
      });
      
      // Fetch friend profiles
      if (friendUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', friendUserIds);
          
        if (!profilesError) {
          setFriends(profiles || []);
        }
      }
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;
    
    // Incoming requests
    const { data: incoming, error: incomingError } = await supabase
      .from('friends')
      .select('*')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    // Outgoing requests
    const { data: outgoing, error: outgoingError } = await supabase
      .from('friends')
      .select('*')
      .eq('requester_id', user.id)
      .eq('status', 'pending');

    if (incomingError || outgoingError) {
      console.error('Error fetching friend requests:', incomingError || outgoingError);
    } else {
      // Fetch profiles for incoming requests
      if (incoming && incoming.length > 0) {
        const requesterIds = incoming.map(req => req.requester_id);
        const { data: requesterProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', requesterIds);
          
        const requestsWithProfiles = incoming.map(req => ({
          ...req,
          requester_profile: requesterProfiles?.find(p => p.user_id === req.requester_id)
        }));
        setFriendRequests(requestsWithProfiles);
      } else {
        setFriendRequests([]);
      }
      
      // Fetch profiles for outgoing requests
      if (outgoing && outgoing.length > 0) {
        const addresseeIds = outgoing.map(req => req.addressee_id);
        const { data: addresseeProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', addresseeIds);
          
        const requestsWithProfiles = outgoing.map(req => ({
          ...req,
          addressee_profile: addresseeProfiles?.find(p => p.user_id === req.addressee_id)
        }));
        setSentRequests(requestsWithProfiles);
      } else {
        setSentRequests([]);
      }
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('friends')
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
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
      fetchFriendRequests();
    }
  };

  const respondToFriendRequest = async (requestId: string, action: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('friends')
      .update({ status: action })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} friend request`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Friend request ${action}!`
      });
      fetchFriends();
      fetchFriendRequests();
    }
  };

  const startChat = (friendUserId: string) => {
    navigate(`/chat/${friendUserId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Friends</h1>
          
          {/* Search Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by username or display name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={loading}>
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile.profile_photo_url} />
                          <AvatarFallback>
                            {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.display_name}</p>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
                        </div>
                      </div>
                      <Button onClick={() => sendFriendRequest(profile.user_id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="friends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                My Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests">
                Requests ({friendRequests.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Friends List */}
            <TabsContent value="friends" className="space-y-4">
              {friends.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No friends yet. Start by searching for people to connect with!</p>
                  </CardContent>
                </Card>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.profile_photo_url} />
                          <AvatarFallback>
                            {friend.display_name?.charAt(0) || friend.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{friend.display_name}</h3>
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                          {friend.bio && <p className="text-sm text-muted-foreground mt-1">{friend.bio}</p>}
                        </div>
                      </div>
                      <Button onClick={() => startChat(friend.user_id)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Incoming Friend Requests */}
            <TabsContent value="requests" className="space-y-4">
              {friendRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No pending friend requests</p>
                  </CardContent>
                </Card>
              ) : (
                friendRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.requester_profile?.profile_photo_url} />
                          <AvatarFallback>
                            {request.requester_profile?.display_name?.charAt(0) || request.requester_profile?.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.requester_profile?.display_name}</h3>
                          <p className="text-sm text-muted-foreground">@{request.requester_profile?.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => respondToFriendRequest(request.id, 'accepted')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => respondToFriendRequest(request.id, 'declined')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Sent Friend Requests */}
            <TabsContent value="sent" className="space-y-4">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No sent friend requests</p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.addressee_profile?.profile_photo_url} />
                          <AvatarFallback>
                            {request.addressee_profile?.display_name?.charAt(0) || request.addressee_profile?.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.addressee_profile?.display_name}</h3>
                          <p className="text-sm text-muted-foreground">@{request.addressee_profile?.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Sent {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}