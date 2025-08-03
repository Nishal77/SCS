# 🗄️ Supabase Storage Setup Guide

## 📋 Prerequisites
- ✅ Supabase project created
- ✅ Environment variables set in `.env` file
- ✅ Supabase client configured

## 🚀 Manual Storage Bucket Setup

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Navigate to Storage
1. In the left sidebar, click on **"Storage"**
2. You'll see the storage management interface

### Step 3: Create Storage Bucket
1. Click **"Create a new bucket"** button
2. Fill in the bucket details:
   - **Name**: `product-menu`
   - **Public bucket**: ✅ **Check this box** (important!)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### Step 4: Configure Bucket Settings
1. Click on the created `product-menu` bucket
2. Go to **"Settings"** tab
3. Ensure **"Public bucket"** is enabled
4. Set **"File size limit"** to `5 MB`
5. Add **"Allowed MIME types"**:
   ```
   image/jpeg
   image/png
   image/gif
   image/webp
   ```

### Step 5: Set Up Row Level Security (RLS)
1. Go to **"Policies"** tab
2. Click **"New Policy"**
3. Choose **"Create a policy from scratch"**
4. Configure the policy:
   - **Policy name**: `Allow public read access`
   - **Target roles**: `public`
   - **Using policy definition**:
   ```sql
   SELECT true;
   ```
5. Click **"Review"** and **"Save policy"**

## 🔧 Alternative: SQL Setup

If you prefer using SQL, run this in the Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-menu',
    'product-menu',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for public read access
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-menu');
```

## ✅ Verification

### Test Upload
1. Go to your app's staff dashboard
2. Try to add a new product
3. Upload an image using the new upload component
4. Verify the image appears in the preview

### Quick Test
You can also test the upload functionality by adding this route to your app:

```jsx
// In your App.jsx, add this route for testing
import UploadTest from './components/UploadTest';

// Add this route
<Route path="/test-upload" element={<UploadTest />} />
```

Then visit `http://localhost:5174/test-upload` to test uploads independently.

### Check Storage
1. Go to Supabase Dashboard → Storage
2. Click on `product-menu` bucket
3. You should see uploaded images listed

## 🐛 Troubleshooting

### Error: "Storage bucket not found"
- ✅ Ensure bucket name is exactly `product-menu`
- ✅ Check that bucket is created in the correct project
- ✅ Verify bucket is set to public

### Error: "new row violates row-level security policy"
- ✅ Create RLS policy for public read access
- ✅ Ensure bucket is public
- ✅ Check bucket permissions

### Error: "File size too large"
- ✅ Ensure file is under 5MB
- ✅ Check bucket file size limit setting

### Error: "Invalid file type"
- ✅ Ensure file is JPEG, PNG, GIF, or WebP
- ✅ Check bucket allowed MIME types setting

## 📱 Usage

Once setup is complete, you can:

1. **Upload Images**: Drag & drop or click to select
2. **Preview Images**: See uploaded images immediately
3. **Remove Images**: Click the X button to remove
4. **Automatic Storage**: Images are stored in Supabase storage
5. **Public URLs**: Images are accessible via public URLs

## 🔒 Security Notes

- ✅ Bucket is public for read access (images need to be publicly viewable)
- ✅ File size limit prevents abuse
- ✅ MIME type restrictions ensure only images
- ✅ Unique filenames prevent conflicts
- ✅ RLS policies control access

## 📞 Support

If you encounter issues:
1. Check the error messages in the browser console
2. Verify all setup steps are completed
3. Check Supabase dashboard for bucket status
4. Ensure environment variables are correct 