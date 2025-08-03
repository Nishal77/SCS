ALTER TABLE inventory 
ADD COLUMN stock_available INTEGER DEFAULT 0 CHECK (stock_available >= 0),
ADD COLUMN stock_constant INTEGER DEFAULT 0 CHECK (stock_constant >= 0);
