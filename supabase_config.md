# 🚀 **SUPABASE CONFIGURATION GUIDE**

## **📋 OVERVIEW**

This document consolidates all Supabase configuration, setup, and troubleshooting information for the Smart Canteen Management System (CMS).

## **🔧 INITIAL SETUP**

### **1. Environment Configuration**
```bash
# Copy the example environment file
cp env.example .env

# Configure your .env file with Supabase credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **2. Database Schema Setup**

#### **Core Tables Structure**
```sql
-- Users table (handled by Supabase Auth)
-- Automatically created by Supabase

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_name TEXT,
    user_phone TEXT,
    order_number TEXT UNIQUE,
    token_number TEXT,
    otp TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'online',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'Pending',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    stock_available INTEGER DEFAULT 0 CHECK (stock_available >= 0),
    stock_constant INTEGER DEFAULT 0 CHECK (stock_constant >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Cart table
CREATE TABLE IF NOT EXISTS user_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    item_id UUID REFERENCES inventory(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## **🔐 ROW LEVEL SECURITY (RLS)**

### **Transactions Table Policies**
```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff can view all transactions
CREATE POLICY "Staff can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'staff'
        )
    );
```

### **Inventory Table Policies**
```sql
-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Anyone can view inventory
CREATE POLICY "Anyone can view inventory" ON inventory
    FOR SELECT USING (true);

-- Staff can manage inventory
CREATE POLICY "Staff can manage inventory" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'staff'
        )
    );
```

### **Categories Table Policies**
```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Staff can manage categories
CREATE POLICY "Staff can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'staff'
        )
    );
```

## **📊 DATABASE MIGRATIONS**

### **Migration Files Location**
```
supabase/
└── migrations/
    ├── 20250115000000_create_comprehensive_order_system.sql
    ├── 20250115000000_update_otp_generation.sql
    ├── 20250115000001_create_simple_transactions.sql
    ├── 20250116000000_fix_user_id_foreign_key.sql
    ├── 20250728154619_add_stock_fields_to_inventory.sql
    ├── 20250728154620_add_todays_special_field.sql
    ├── 20250728154621_improve_price_field.sql
    ├── 20250728154622_create_user_cart_table.sql
    ├── 20250728154623_create_categories_table.sql
    └── 20250728154624_create_category_images_bucket.sql
```

### **Running Migrations**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Go to SQL Editor and run each migration file
```

## **🔄 REAL-TIME FEATURES**

### **Real-time Subscriptions**
```javascript
// Subscribe to transaction changes
const subscription = supabase
    .channel('transactions')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
            console.log('Transaction change:', payload);
            // Handle real-time updates
        }
    )
    .subscribe();

// Subscribe to inventory changes
const inventorySubscription = supabase
    .channel('inventory')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
            console.log('Inventory change:', payload);
            // Handle real-time updates
        }
    )
    .subscribe();
```

### **Channel Management**
```javascript
// Proper cleanup of subscriptions
useEffect(() => {
    const subscription = supabase
        .channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
            console.log('Change received!', payload);
        })
        .subscribe();

    return () => subscription.unsubscribe();
}, []);
```

## **🗄️ STORAGE SETUP**

### **Storage Buckets**
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('category-images', 'category-images', true),
    ('inventory-images', 'inventory-images', true),
    ('user-avatars', 'user-avatars', true);

-- Storage policies for category images
CREATE POLICY "Anyone can view category images" ON storage.objects
    FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Staff can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'staff'
        )
    );
```

## **🔍 TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. RLS Policy Errors**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### **2. Foreign Key Constraint Errors**
```sql
-- Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';
```

#### **3. Authentication Issues**
```javascript
// Check user session
const { data: { session }, error } = await supabase.auth.getSession();

// Check user metadata
const { data: { user }, error } = await supabase.auth.getUser();

// Verify user role
const userRole = user?.user_metadata?.role;
```

### **Debug Queries**
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Check recent transactions
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- Check inventory status
SELECT item_name, stock_available, price, category 
FROM inventory 
ORDER BY stock_available ASC;
```

## **📱 CLIENT CONFIGURATION**

### **Supabase Client Setup**
```javascript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});
```

### **Environment Variables**
```env
# .env file
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## **🚀 DEPLOYMENT**

### **Production Considerations**
1. **Enable SSL**: Ensure HTTPS is enabled
2. **Rate Limiting**: Configure appropriate rate limits
3. **Backup Strategy**: Set up automated database backups
4. **Monitoring**: Enable Supabase analytics and monitoring
5. **Security**: Regularly review and update RLS policies

### **Performance Optimization**
```sql
-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_user_cart_user_id ON user_cart(user_id);

-- Enable row level security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cart ENABLE ROW LEVEL SECURITY;
```

## **📚 ADDITIONAL RESOURCES**

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Storage Management](https://supabase.com/docs/guides/storage)

---

**This configuration guide covers all essential aspects of setting up and maintaining your Supabase backend for the Smart Canteen Management System.**
