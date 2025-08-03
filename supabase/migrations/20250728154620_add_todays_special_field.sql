-- Add is_todays_special field to inventory table
ALTER TABLE inventory 
ADD COLUMN is_todays_special BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering today's special items
CREATE INDEX idx_inventory_todays_special ON inventory(is_todays_special) WHERE is_todays_special = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN inventory.is_todays_special IS 'Marks items as today''s special for display in Hot Picks section'; 