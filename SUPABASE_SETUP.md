# Supabase Setup Guide

## 🔧 Configuration Required

The canteen management system requires Supabase to be properly configured to save inventory data. Follow these steps:

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Note down your project URL and anon key

### 2. Set Up Environment Variables

1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Database Schema

The system expects an `inventory` table with the following structure:

```sql
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    min_to_cook INTEGER DEFAULT 0,
    stock_constant INTEGER DEFAULT 0,
    stock_available INTEGER DEFAULT 0,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies if needed
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
```

### 4. Test the Connection

After setting up the environment variables:

1. Restart your development server
2. Open the browser console
3. You should see: "✅ Supabase connection successful"

### 5. Troubleshooting

If you see "❌ Supabase connection failed":
- Check your environment variables are correct
- Ensure your Supabase project is active
- Verify the `inventory` table exists
- Check browser console for specific error messages

## 🚀 Ready to Use

Once configured, you can:
- Add products in the staff dashboard
- View products in the user dashboard
- Real-time updates between dashboards
- Full CRUD operations on inventory 