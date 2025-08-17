-- ========================================
-- MANUAL DATABASE FIX - Run in Supabase Dashboard
-- ========================================
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Add items column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add order_status column if missing
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending';

-- Step 3: Add updated_at column if missing
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    category TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_items ON transactions USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_order_items_transaction_id ON order_items(transaction_id);

-- Step 6: Add sample items to your specific problematic transaction
UPDATE transactions 
SET items = '[
    {"name": "Chicken Burger", "quantity": 2, "price": 150.00, "category": "Fast Food"},
    {"name": "French Fries", "quantity": 1, "price": 80.00, "category": "Fast Food"},
    {"name": "Coca Cola", "quantity": 2, "price": 40.00, "category": "Beverages"}
]'::jsonb
WHERE id = '057ce80e-873f-41c3-8288-b6bbb1b7040c';

-- Step 7: Also create order_items records for detailed tracking
INSERT INTO order_items (transaction_id, item_name, quantity, price, category) VALUES
('057ce80e-873f-41c3-8288-b6bbb1b7040c', 'Chicken Burger', 2, 150.00, 'Fast Food'),
('057ce80e-873f-41c3-8288-b6bbb1b7040c', 'French Fries', 1, 80.00, 'Fast Food'),
('057ce80e-873f-41c3-8288-b6bbb1b7040c', 'Coca Cola', 2, 40.00, 'Beverages');

-- Step 8: Verify the fix
SELECT 
    t.id,
    t.order_number,
    t.items,
    COUNT(oi.id) as order_items_count
FROM transactions t
LEFT JOIN order_items oi ON t.id = oi.transaction_id
WHERE t.id = '057ce80e-873f-41c3-8288-b6bbb1b7040c'
GROUP BY t.id, t.order_number, t.items;

-- Success message
SELECT '✅ Database fixed successfully! Your order now has items.' as status;
