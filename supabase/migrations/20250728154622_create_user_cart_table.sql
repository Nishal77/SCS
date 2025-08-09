-- Create user_cart table for storing cart items
CREATE TABLE IF NOT EXISTS user_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_quantity_reasonable CHECK (quantity <= 100),
    
    -- Foreign key constraints
    CONSTRAINT fk_user_cart_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_cart_product_id FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate items in cart
    CONSTRAINT unique_user_product UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_product_id ON user_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_created_at ON user_cart(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_cart_updated_at 
    BEFORE UPDATE ON user_cart 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_cart IS 'Stores user shopping cart items with quantity and stock validation';
COMMENT ON COLUMN user_cart.user_id IS 'Reference to authenticated user';
COMMENT ON COLUMN user_cart.product_id IS 'Reference to inventory item';
COMMENT ON COLUMN user_cart.quantity IS 'Quantity of items in cart (1-100)';
COMMENT ON COLUMN user_cart.created_at IS 'When item was first added to cart';
COMMENT ON COLUMN user_cart.updated_at IS 'When item quantity was last updated';

-- Enable Row Level Security (RLS)
ALTER TABLE user_cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cart items" ON user_cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON user_cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON user_cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON user_cart
    FOR DELETE USING (auth.uid() = user_id);
