-- ========================================
-- Comprehensive Order Management System
-- ========================================

-- ========================================
-- 1. Enhanced Transactions Table
-- ========================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    subtotal_amount NUMERIC(10, 2) NOT NULL CHECK (subtotal_amount >= 0),
    service_fee NUMERIC(10, 2) DEFAULT 25.00,
    discount_amount NUMERIC(10, 2) DEFAULT 50.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online', 'card', 'upi')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
    payment_gateway TEXT, -- 'razorpay', 'stripe', etc.
    payment_gateway_order_id TEXT,
    payment_gateway_payment_id TEXT,
    payment_gateway_signature TEXT,
    otp TEXT,
    token_number TEXT,
    order_number TEXT UNIQUE NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'preparing', 'ready', 'collected', 'cancelled')),
    pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    special_instructions TEXT,
    dining_option TEXT CHECK (dining_option IN ('dine-in', 'takeaway', 'grab-and-go')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    collected_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT
);

-- ========================================
-- 2. Order Items Table (Detailed Order Items)
-- ========================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    item_description TEXT,
    category TEXT,
    image_url TEXT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Order History Table (Status Tracking)
-- ========================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    status_message TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. Payment History Table
-- ========================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    payment_status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    gateway_response JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. Customer Feedback Table
-- ========================================
CREATE TABLE IF NOT EXISTS order_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    food_quality_rating INTEGER CHECK (food_quality_rating >= 1 AND food_quality_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_number ON transactions(order_number);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_order_status ON transactions(order_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_token_number ON transactions(token_number);
CREATE INDEX IF NOT EXISTS idx_transactions_otp ON transactions(otp);

CREATE INDEX IF NOT EXISTS idx_order_items_transaction_id ON order_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_transaction_id ON order_status_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_id ON payment_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

-- ========================================
-- 7. Functions for Auto-Generation
-- ========================================

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get count of orders for today
    SELECT COALESCE(COUNT(*), 0) + 1 INTO counter
    FROM transactions 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Pad counter with zeros
    order_num := order_num || LPAD(counter::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to generate OTP and Token
CREATE OR REPLACE FUNCTION set_transaction_otp_and_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run when payment_status changes to 'success'
    IF NEW.payment_status = 'success' 
       AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN

        -- Generate a 6-digit OTP
        NEW.otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

        -- Generate a unique token (prefix T + timestamp + random)
        NEW.token_number := 'T' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || 
                           LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status history
CREATE OR REPLACE FUNCTION update_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert status change into history
    INSERT INTO order_status_history (transaction_id, status, status_message)
    VALUES (NEW.id, NEW.order_status, 'Order status updated to ' || NEW.order_status);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment history
CREATE OR REPLACE FUNCTION update_payment_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert payment status change into history
    INSERT INTO payment_history (transaction_id, payment_status, payment_method, amount)
    VALUES (NEW.id, NEW.payment_status, NEW.payment_method, NEW.total_amount);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. Triggers
-- ========================================

-- Trigger for OTP and Token generation
DROP TRIGGER IF EXISTS trigger_set_otp_and_token ON transactions;
CREATE TRIGGER trigger_set_otp_and_token
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_otp_and_token();

-- Trigger for order status history
DROP TRIGGER IF EXISTS trigger_order_status_history ON transactions;
CREATE TRIGGER trigger_order_status_history
    AFTER UPDATE OF order_status ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_order_status_history();

-- Trigger for payment history
DROP TRIGGER IF EXISTS trigger_payment_history ON transactions;
CREATE TRIGGER trigger_payment_history
    AFTER UPDATE OF payment_status ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_history();

-- ========================================
-- 9. Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = order_items.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = order_items.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

-- Order status history policies
CREATE POLICY "Users can view their own order status history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = order_status_history.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

-- Payment history policies
CREATE POLICY "Users can view their own payment history" ON payment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = payment_history.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

-- Order feedback policies
CREATE POLICY "Users can view their own feedback" ON order_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON order_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 10. Views for Easy Data Access
-- ========================================

-- View for complete order details
CREATE OR REPLACE VIEW order_details AS
SELECT 
    t.id as transaction_id,
    t.order_number,
    t.user_id,
    t.user_email,
    t.user_name,
    t.user_phone,
    t.total_amount,
    t.subtotal_amount,
    t.service_fee,
    t.discount_amount,
    t.payment_method,
    t.payment_status,
    t.payment_gateway,
    t.payment_gateway_order_id,
    t.payment_gateway_payment_id,
    t.otp,
    t.token_number,
    t.order_status,
    t.pickup_time,
    t.estimated_pickup_time,
    t.special_instructions,
    t.dining_option,
    t.created_at,
    t.updated_at,
    t.collected_at,
    t.cancelled_at,
    t.cancelled_reason,
    -- Order items as JSON
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'item_name', oi.item_name,
                'item_description', oi.item_description,
                'category', oi.category,
                'image_url', oi.image_url,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'total_price', oi.total_price,
                'special_requests', oi.special_requests
            ) ORDER BY oi.created_at
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
    ) as order_items,
    -- Status history as JSON
    COALESCE(
        json_agg(
            json_build_object(
                'status', osh.status,
                'status_message', osh.status_message,
                'updated_at', osh.updated_at
            ) ORDER BY osh.updated_at DESC
        ) FILTER (WHERE osh.id IS NOT NULL),
        '[]'::json
    ) as status_history
FROM transactions t
LEFT JOIN order_items oi ON t.id = oi.transaction_id
LEFT JOIN order_status_history osh ON t.id = osh.transaction_id
GROUP BY t.id;

-- ========================================
-- 11. Sample Data Insertion (Optional)
-- ========================================

-- Insert sample transaction (uncomment if needed for testing)
/*
INSERT INTO transactions (
    user_id,
    user_email,
    user_name,
    total_amount,
    subtotal_amount,
    payment_method,
    payment_status,
    order_number,
    order_status,
    dining_option
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'test@mite.ac.in',
    'Test User',
    562.00,
    587.00,
    'online',
    'success',
    generate_order_number(),
    'pending',
    'takeaway'
);
*/

-- ========================================
-- 12. Comments and Documentation
-- ========================================

COMMENT ON TABLE transactions IS 'Main transactions table storing all order and payment information';
COMMENT ON TABLE order_items IS 'Detailed items in each order with pricing and quantities';
COMMENT ON TABLE order_status_history IS 'Audit trail of order status changes';
COMMENT ON TABLE payment_history IS 'Audit trail of payment status changes';
COMMENT ON TABLE order_feedback IS 'Customer feedback and ratings for orders';

COMMENT ON COLUMN transactions.otp IS '6-digit OTP for order collection';
COMMENT ON COLUMN transactions.token_number IS 'Unique token number for order identification';
COMMENT ON COLUMN transactions.order_number IS 'Human-readable order number (e.g., ORD202501150001)';
COMMENT ON COLUMN transactions.payment_gateway_order_id IS 'External payment gateway order ID';
COMMENT ON COLUMN transactions.payment_gateway_payment_id IS 'External payment gateway payment ID';
COMMENT ON COLUMN transactions.payment_gateway_signature IS 'Payment gateway signature for verification';
