-- ========================================
-- CHECK DATABASE STRUCTURE
-- ========================================
-- Run this in your Supabase SQL Editor to see what tables and columns exist

-- Check if inventory table exists and its structure
SELECT 
    'INVENTORY TABLE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory'
ORDER BY ordinal_position;

-- Check if transactions table exists and its structure
SELECT 
    'TRANSACTIONS TABLE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Check all tables in your database
SELECT 
    'ALL TABLES' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if inventory table has data
SELECT 
    'INVENTORY DATA COUNT' as info,
    COUNT(*) as total_items
FROM inventory;

-- Check if transactions table has data
SELECT 
    'TRANSACTIONS DATA COUNT' as info,
    COUNT(*) as total_transactions
FROM transactions;

-- Show sample inventory data (if exists)
SELECT 
    'SAMPLE INVENTORY' as info,
    item_name,
    price,
    category
FROM inventory
LIMIT 5;

-- Show sample transaction data (if exists)
SELECT 
    'SAMPLE TRANSACTIONS' as info,
    id,
    order_number,
    total_amount,
    payment_status
FROM transactions
LIMIT 5;
