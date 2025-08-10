-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'category-images',
    'category-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

-- Create policy for public to view category images
CREATE POLICY "Public can view category images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'category-images'
    );

-- Create policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update category images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

-- Create policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );
