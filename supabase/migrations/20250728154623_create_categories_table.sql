-- Create categories table for managing food categories with custom images
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    custom_image_url TEXT, -- For user-uploaded images
    color_scheme VARCHAR(50), -- For UI styling
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories based on existing inventory
INSERT INTO categories (name, description, color_scheme, sort_order) VALUES
    ('Breakfast', 'Morning meals and breakfast items', 'bg-blue-100 text-blue-700 border-blue-200', 1),
    ('Indian main', 'Traditional Indian main course dishes', 'bg-green-100 text-green-700 border-green-200', 2),
    ('Chinese', 'Chinese cuisine and dishes', 'bg-red-100 text-red-700 border-red-200', 3),
    ('Snacks', 'Quick bites and snack items', 'bg-yellow-100 text-yellow-700 border-yellow-200', 4),
    ('Combo meals', 'Complete meal combinations', 'bg-orange-100 text-orange-700 border-orange-200', 5),
    ('Beverages', 'Drinks and beverages', 'bg-purple-100 text-purple-700 border-purple-200', 6),
    ('Fresh juices', 'Natural fruit juices', 'bg-cyan-100 text-cyan-700 border-cyan-200', 7),
    ('Milkshakes', 'Creamy milkshakes', 'bg-pink-100 text-pink-700 border-pink-200', 8),
    ('Lunch', 'Lunch time favorites', 'bg-indigo-100 text-indigo-700 border-indigo-200', 9),
    ('Dinner', 'Evening meal selections', 'bg-gray-100 text-gray-700 border-gray-200', 10)
ON CONFLICT (name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for staff access
CREATE POLICY "Staff can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();
