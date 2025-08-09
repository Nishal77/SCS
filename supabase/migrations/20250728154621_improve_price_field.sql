-- Improve price field with proper constraints and validation
ALTER TABLE inventory 
ADD CONSTRAINT check_price_positive CHECK (price >= 0),
ADD CONSTRAINT check_price_not_null CHECK (price IS NOT NULL);

-- Add index for better performance when filtering by price
CREATE INDEX idx_inventory_price ON inventory(price);

-- Add comment for documentation
COMMENT ON COLUMN inventory.price IS 'Product price in Indian Rupees (₹). Must be positive and not null.';

-- Update existing records to ensure price is valid
UPDATE inventory SET price = 0 WHERE price IS NULL OR price < 0;
