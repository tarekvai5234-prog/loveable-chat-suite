-- Create storage buckets for profile photos and message media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('messages', 'messages', true);

-- Create RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for covers bucket
CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for messages bucket
CREATE POLICY "Users can view message media they're involved in"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'messages' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid()::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add media_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Add cover_photo_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;