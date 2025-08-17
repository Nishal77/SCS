-- ========================================
-- SETUP INVENTORY TABLE FOR SMART CANTEEN
-- ========================================
-- Run this in your Supabase SQL Editor to create the inventory table

-- Step 1: Create inventory table (without is_available column)
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

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_item_name ON inventory(item_name);

-- Step 3: Add sample inventory data
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
('Ice Cream', 'Vanilla ice cream with chocolate sauce', 60.00, 'Desserts', 50, 50)
ON CONFLICT (item_name) DO NOTHING;

-- Step 4: Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Anyone can view inventory" ON inventory
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage inventory" ON inventory
    FOR ALL USING (true);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Step 7: Verify the setup
SELECT 
    '✅ INVENTORY TABLE SETUP COMPLETE!' as status,
    COUNT(*) as total_items
FROM inventory;

-- Step 8: Show sample data
SELECT item_name, price, category, stock_available
FROM inventory
ORDER BY category, item_name;
