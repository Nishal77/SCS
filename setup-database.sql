-- ========================================
-- Smart Canteen Order System Database Setup
-- ========================================
-- This script sets up the complete database structure for the order system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. TRANSACTIONS TABLE
-- ========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS transactions CASCADE;

-- Create the comprehensive transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    subtotal_amount NUMERIC(10, 2) DEFAULT 0,
    service_fee NUMERIC(10, 2) DEFAULT 25.00,
    discount_amount NUMERIC(10, 2) DEFAULT 50.00,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_gateway TEXT DEFAULT 'razorpay',
    order_number TEXT UNIQUE,
    order_status TEXT DEFAULT 'Pending',
    dining_option TEXT DEFAULT 'takeaway',
    special_instructions TEXT,
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    otp TEXT,
    token_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_order_number ON transactions(order_number);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_order_status ON transactions(order_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_items ON transactions USING GIN (items);

-- ========================================
-- 2. ORDER_ITEMS TABLE
-- ========================================

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

-- ========================================
-- 3. INVENTORY TABLE
-- ========================================

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    category TEXT,
    stock_available INTEGER DEFAULT 0 CHECK (stock_available >= 0),
    stock_constant INTEGER DEFAULT 0 CHECK (stock_constant >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for inventory table
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(is_available);

-- ========================================
-- 4. USER_CART TABLE
-- ========================================

-- Create user_cart table for shopping cart management
CREATE TABLE IF NOT EXISTS user_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate items in cart
    CONSTRAINT unique_user_product UNIQUE(user_id, product_id)
);

-- Create indexes for user_cart table
CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_product_id ON user_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_created_at ON user_cart(created_at);

-- ========================================
-- 5. TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to auto-generate OTP & Token when payment is successful
CREATE OR REPLACE FUNCTION set_transaction_otp_and_token()
RETURNS TRIGGER AS $$
DECLARE
    next_token_number INTEGER;
    random_otp TEXT;
BEGIN
    -- Only run when payment_status changes to 'success'
    IF NEW.payment_status = 'success'
       AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN

        -- Generate a truly random 6-digit OTP
        random_otp := LPAD(
            (FLOOR(RANDOM() * 1000000) + 
             FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000) % 1000000 + 
             FLOOR(RANDOM() * 1000000)) % 1000000
        ::TEXT, 6, '0');
        
        -- Ensure OTP is not 000000
        IF random_otp = '000000' THEN
            random_otp := '123456';
        END IF;
        
        NEW.otp := random_otp;

        -- Get the next sequential token number
        SELECT COALESCE(MAX(CAST(SUBSTRING(token_number FROM 2) AS INTEGER)), 0) + 1
        INTO next_token_number
        FROM transactions
        WHERE token_number ~ '^M[0-9]+$';

        -- Generate a unique token (prefix M + sequential number)
        NEW.token_number := 'M' || LPAD(next_token_number::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_otp_and_token ON transactions;
CREATE TRIGGER trigger_set_otp_and_token
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_otp_and_token();

CREATE TRIGGER IF NOT EXISTS trigger_update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_user_cart_updated_at
    BEFORE UPDATE ON user_cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cart ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Staff can update all transactions" ON transactions
    FOR UPDATE USING (true);

-- RLS Policies for order_items
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

CREATE POLICY "Staff can insert order items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update order items" ON order_items
    FOR UPDATE USING (true);

-- RLS Policies for inventory
CREATE POLICY "Anyone can view available inventory" ON inventory
    FOR SELECT USING (is_available = true);

CREATE POLICY "Staff can manage inventory" ON inventory
    FOR ALL USING (true);

-- RLS Policies for user_cart
CREATE POLICY "Users can view their own cart items" ON user_cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON user_cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON user_cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON user_cart
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 7. SAMPLE DATA
-- ========================================

-- Insert sample inventory items
INSERT INTO inventory (item_name, description, price, category, stock_available, stock_constant) VALUES
('Chicken Burger', 'Delicious grilled chicken burger with fresh vegetables', 150.00, 'Fast Food', 50, 50),
('Veg Burger', 'Fresh vegetable burger with cheese and special sauce', 120.00, 'Fast Food', 40, 40),
('French Fries', 'Crispy golden fries served with ketchup', 80.00, 'Fast Food', 100, 100),
('Chicken Wings', 'Spicy chicken wings with dipping sauce', 200.00, 'Fast Food', 30, 30),
('Pizza Margherita', 'Classic pizza with tomato sauce and mozzarella', 250.00, 'Fast Food', 25, 25),
('Coca Cola', 'Refreshing carbonated soft drink', 40.00, 'Beverages', 200, 200),
('Sprite', 'Lemon-lime flavored soft drink', 40.00, 'Beverages', 200, 200),
('Coffee', 'Hot brewed coffee with milk and sugar', 30.00, 'Beverages', 100, 100),
('Tea', 'Hot tea with milk and sugar', 25.00, 'Beverages', 100, 100),
('Ice Cream', 'Vanilla ice cream with chocolate sauce', 60.00, 'Desserts', 50, 50);

-- ========================================
-- 8. COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE transactions IS 'Main table for storing order and payment information';
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

COMMENT ON TABLE inventory IS 'Product catalog and stock management';
COMMENT ON COLUMN inventory.stock_available IS 'Current available stock quantity';
COMMENT ON COLUMN inventory.stock_constant IS 'Constant stock level for reordering';

COMMENT ON TABLE user_cart IS 'User shopping cart management';
COMMENT ON COLUMN user_cart.user_id IS 'Reference to authenticated user';
COMMENT ON COLUMN user_cart.product_id IS 'Reference to inventory item';
COMMENT ON COLUMN user_cart.quantity IS 'Quantity of items in cart (1-100)';

-- ========================================
-- 9. FINAL SETUP COMPLETE
-- ========================================

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Smart Canteen Order System Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- transactions (with items JSONB column)';
    RAISE NOTICE '- order_items (detailed item tracking)';
    RAISE NOTICE '- inventory (product catalog)';
    RAISE NOTICE '- user_cart (shopping cart)';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample data inserted:';
    RAISE NOTICE '- 10 inventory items';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your staff dashboard';
    RAISE NOTICE '2. Click "🔄 Refresh Orders" to see orders with items';
    RAISE NOTICE '3. Use "🔍 Fix This Order" button to add items to existing orders';
    RAISE NOTICE '========================================';
END $$;
