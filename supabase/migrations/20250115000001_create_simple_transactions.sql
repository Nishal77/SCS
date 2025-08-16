-- ========================================
-- Create Simple Transactions Table
-- ========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS transactions CASCADE;

-- Create the simple transactions table as specified by the user
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL, -- e.g. 'UPI', 'Card', 'Cash'
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
    otp TEXT,
    token_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_number TEXT UNIQUE
);

-- Create index for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_order_number ON transactions(order_number);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);

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

-- Trigger to run the OTP & Token generation function
DROP TRIGGER IF EXISTS trigger_set_otp_and_token ON transactions;
CREATE TRIGGER trigger_set_otp_and_token
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_otp_and_token();

-- Add comment
COMMENT ON TABLE transactions IS 'Simple transactions table for storing order and payment information';
COMMENT ON FUNCTION set_transaction_otp_and_token() IS 'Generates random OTP and sequential token when payment is successful';
