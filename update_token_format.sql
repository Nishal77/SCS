-- Update Token Format to Perfect Format #tok-001
-- Run this script in your Supabase SQL Editor

-- Step 1: Update existing transactions to new format (just numeric part)
UPDATE transactions 
SET token_number = '001' 
WHERE token_number = 'M001';

-- Step 2: Update the database function to generate just numeric tokens
CREATE OR REPLACE FUNCTION public.set_transaction_otp_and_token()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    next_token_seq INTEGER;
BEGIN
    -- Only run when payment_status changes to 'success'
    IF NEW.payment_status = 'success'
       AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN

        -- Generate a 6-digit OTP
        NEW.otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

        -- Get the next sequence number for tokens (just numeric part)
        SELECT COALESCE(MAX(CAST(token_number AS INTEGER)), 0) + 1
        INTO next_token_seq
        FROM transactions 
        WHERE token_number ~ '^[0-9]+$';

        -- Generate a unique token (just numeric part, padded to 3 digits)
        NEW.token_number := LPAD(next_token_seq::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$function$;

-- Step 3: Verify the function was updated
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'set_transaction_otp_and_token';

-- Step 4: Test the function with a sample transaction
-- (This will show you what the next token would be)
SELECT 
    COALESCE(MAX(CAST(token_number AS INTEGER)), 0) + 1 as next_token_number,
    LPAD((COALESCE(MAX(CAST(token_number AS INTEGER)), 0) + 1)::TEXT, 3, '0') as next_token_formatted
FROM transactions 
WHERE token_number ~ '^[0-9]+$';

-- Step 5: Show current token numbers
SELECT id, order_number, token_number, otp, payment_status, created_at
FROM transactions 
WHERE token_number IS NOT NULL
ORDER BY created_at DESC;
