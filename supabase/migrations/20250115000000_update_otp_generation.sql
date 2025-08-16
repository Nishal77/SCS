-- ========================================
-- Update OTP Generation for Better Randomness
-- ========================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_set_otp_and_token ON transactions;

-- Update the function for better OTP generation
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
        -- Use multiple random sources for better randomness
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

-- Recreate the trigger
CREATE TRIGGER trigger_set_otp_and_token
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_otp_and_token();

-- Add comment
COMMENT ON FUNCTION set_transaction_otp_and_token() IS 'Generates random OTP and sequential token when payment is successful';
