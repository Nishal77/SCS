-- ========================================
-- Add Items Column to Transactions Table
-- ========================================

-- Add items column to transactions table to store order items as JSON
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for items column for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_items ON transactions USING GIN (items);

-- Create order_items table for detailed item tracking
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

-- Create indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_transaction_id ON order_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_name ON order_items(item_name);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON order_items(category);

-- Create updated_at trigger for order_items
CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_items_updated_at();

-- Create updated_at trigger for transactions
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transactions_updated_at();

-- Enable Row Level Security on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = order_items.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all order items" ON order_items
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON COLUMN transactions.items IS 'JSON array of order items with name, quantity, price, and other details';
COMMENT ON COLUMN transactions.order_status IS 'Current status of the order: Pending, Accepted, Cooking, Ready, Delivered, Rejected';
COMMENT ON COLUMN transactions.updated_at IS 'Timestamp when the transaction was last updated';

COMMENT ON TABLE order_items IS 'Detailed tracking of individual items in each order';
COMMENT ON COLUMN order_items.transaction_id IS 'Reference to the parent transaction';
COMMENT ON COLUMN order_items.item_name IS 'Name of the ordered item';
COMMENT ON COLUMN order_items.quantity IS 'Quantity of the item ordered';
COMMENT ON COLUMN order_items.price IS 'Price per unit of the item';
COMMENT ON COLUMN order_items.image_url IS 'URL to the item image';
COMMENT ON COLUMN order_items.category IS 'Category of the item';
COMMENT ON COLUMN order_items.special_instructions IS 'Any special instructions for the item';
