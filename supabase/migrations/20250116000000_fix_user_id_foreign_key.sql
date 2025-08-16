-- Fix foreign key constraint issue
-- Change transactions.user_id to reference profiles.id instead of auth.users.id

-- Drop the existing foreign key constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Add the new foreign key constraint to reference profiles table
ALTER TABLE transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the change
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='transactions' 
    AND kcu.column_name = 'user_id';
