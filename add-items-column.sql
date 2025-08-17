-- ========================================
-- ADD ITEMS COLUMN TO TRANSACTIONS TABLE
-- ========================================
-- Run this in your Supabase SQL Editor to add the items column

-- Step 1: Add items column (JSONB) to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add order_status column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending';

-- Step 3: Add updated_at column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Create trigger for updated_at (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_transaction_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_updated_at();

-- Step 5: Verify the changes
SELECT 
    '✅ ITEMS COLUMN ADDED!' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name IN ('items', 'order_status', 'updated_at')
ORDER BY column_name;

-- Step 6: Show sample transaction data
SELECT 
    id,
    order_number,
    total_amount,
    items,
    order_status
FROM transactions
LIMIT 3;
