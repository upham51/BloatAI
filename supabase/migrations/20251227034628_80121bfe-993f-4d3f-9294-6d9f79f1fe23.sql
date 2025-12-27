-- Make meal-photos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'meal-photos';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meal photos" ON storage.objects;

-- Create policy for users to view their own photos
CREATE POLICY "Users can view their own meal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to upload their own photos  
CREATE POLICY "Users can upload their own meal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their own photos
CREATE POLICY "Users can delete their own meal photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);