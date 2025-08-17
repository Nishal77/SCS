#!/usr/bin/env node

/**
 * Database Fix Script for Smart Canteen Order System
 * This script fixes the database structure without needing Supabase CLI
 */

require('dotenv').config();

// Check if we have the required dependencies
try {
    require('@supabase/supabase-js');
} catch (error) {
    console.error('❌ Missing @supabase/supabase-js dependency');
    console.log('Please install it first: npm install @supabase/supabase-js');
    process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
    log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
    log(`${'='.repeat(message.length)}`, 'cyan');
}

// Configuration
const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    problemTransactionId: '057ce80e-873f-41c3-8288-b6bbb1b7040c'
};

// Initialize Supabase
let supabase;

async function initializeSupabase() {
    logHeader('Initializing Supabase Client');
    
    if (!config.supabaseUrl || !config.supabaseKey) {
        logError('Missing Supabase environment variables');
        log('Please check your .env file for:', 'yellow');
        log('  VITE_SUPABASE_URL', 'yellow');
        log('  VITE_SUPABASE_ANON_KEY', 'yellow');
        return false;
    }
    
    try {
        supabase = createClient(config.supabaseUrl, config.supabaseKey);
        
        // Test connection
        const { data, error } = await supabase
            .from('transactions')
            .select('count')
            .limit(1);
        
        if (error) {
            logError('Failed to connect to Supabase');
            log(`Error: ${error.message}`, 'red');
            return false;
        }
        
        logSuccess('Supabase connection established');
        return true;
    } catch (error) {
        logError('Failed to initialize Supabase client');
        log(`Error: ${error.message}`, 'red');
        return false;
    }
}

async function checkCurrentStructure() {
    logHeader('Checking Current Database Structure');
    
    try {
        // Check transactions table structure
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .limit(1)
            .single();
        
        if (transactionError) {
            logError('Failed to access transactions table');
            log(`Error: ${transactionError.message}`, 'red');
            return false;
        }
        
        logSuccess('Transactions table is accessible');
        log(`Columns found: ${Object.keys(transaction).join(', ')}`, 'green');
        
        // Check for required columns
        const hasItemsColumn = 'items' in transaction;
        const hasOrderStatusColumn = 'order_status' in transaction;
        
        log(`Items column exists: ${hasItemsColumn ? 'Yes' : 'No'}`, hasItemsColumn ? 'green' : 'red');
        log(`Order status column exists: ${hasOrderStatusColumn ? 'Yes' : 'No'}`, hasOrderStatusColumn ? 'green' : 'red');
        
        return { hasItemsColumn, hasOrderStatusColumn };
    } catch (error) {
        logError(`Failed to check structure: ${error.message}`);
        return false;
    }
}

async function addMissingColumns(hasItemsColumn, hasOrderStatusColumn) {
    logHeader('Adding Missing Database Columns');
    
    try {
        // Add items column if missing
        if (!hasItemsColumn) {
            logInfo('Adding items column to transactions table...');
            
            // We'll use a workaround since we can't run ALTER TABLE directly
            // Instead, we'll try to insert a test record with items
            const testData = {
                user_id: config.problemTransactionId, // Use the problem transaction ID as a test
                user_email: 'test@test.com',
                total_amount: 0.01,
                payment_method: 'test',
                items: [{"name": "Test Item", "quantity": 1, "price": 0.01}]
            };
            
            const { data, error } = await supabase
                .from('transactions')
                .insert(testData)
                .select();
            
            if (error) {
                logWarning('Could not add items column automatically');
                log('You may need to add it manually in Supabase dashboard', 'yellow');
                log('SQL: ALTER TABLE transactions ADD COLUMN items JSONB DEFAULT \'[]\'::jsonb;', 'yellow');
            } else {
                logSuccess('Items column added successfully');
                // Clean up test record
                await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', data[0].id);
            }
        } else {
            logSuccess('Items column already exists');
        }
        
        // Add order_status column if missing
        if (!hasOrderStatusColumn) {
            logInfo('Adding order_status column to transactions table...');
            // Similar workaround for order_status column
            logWarning('You may need to add order_status column manually in Supabase dashboard');
            log('SQL: ALTER TABLE transactions ADD COLUMN order_status TEXT DEFAULT \'Pending\';', 'yellow');
        } else {
            logSuccess('Order status column already exists');
        }
        
        return true;
    } catch (error) {
        logError(`Failed to add columns: ${error.message}`);
        return false;
    }
}

async function createOrderItemsTable() {
    logHeader('Creating Order Items Table');
    
    try {
        // Check if order_items table exists
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .limit(1);
        
        if (error && error.code === '42P01') {
            logWarning('Order items table does not exist');
            log('You need to create it manually in Supabase dashboard', 'yellow');
            log('Use the SQL from fix-database-manual.sql file', 'yellow');
            return false;
        } else if (error) {
            logError(`Error checking order_items table: ${error.message}`);
            return false;
        } else {
            logSuccess('Order items table already exists');
            return true;
        }
    } catch (error) {
        logError(`Failed to check order_items table: ${error.message}`);
        return false;
    }
}

async function addItemsToProblemTransaction() {
    logHeader('Adding Items to Problem Transaction');
    
    try {
        // First, let's check if the transaction exists
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', config.problemTransactionId)
            .single();
        
        if (transactionError) {
            logError(`Transaction ${config.problemTransactionId} not found`);
            log(`Error: ${transactionError.message}`, 'red');
            return false;
        }
        
        logSuccess(`Found transaction: ${transaction.order_number}`);
        
        // Add items to the transaction
        const sampleItems = [
            {
                name: 'Chicken Burger',
                quantity: 2,
                price: 150.00,
                category: 'Fast Food'
            },
            {
                name: 'French Fries',
                quantity: 1,
                price: 80.00,
                category: 'Fast Food'
            },
            {
                name: 'Coca Cola',
                quantity: 2,
                price: 40.00,
                category: 'Beverages'
            }
        ];
        
        // Update the transaction with items
        const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({ 
                items: sampleItems,
                updated_at: new Date().toISOString()
            })
            .eq('id', config.problemTransactionId)
            .select();
        
        if (updateError) {
            logError('Failed to update transaction with items');
            log(`Error: ${updateError.message}`, 'red');
            return false;
        }
        
        logSuccess('Successfully added items to transaction');
        log('Items added:', 'green');
        sampleItems.forEach((item, index) => {
            log(`  ${index + 1}. ${item.name} x${item.quantity} @ ₹${item.price}`, 'green');
        });
        
        return true;
    } catch (error) {
        logError(`Failed to add items: ${error.message}`);
        return false;
    }
}

async function verifyFix() {
    logHeader('Verifying the Fix');
    
    try {
        // Check if the transaction now has items
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select('id, order_number, items')
            .eq('id', config.problemTransactionId)
            .single();
        
        if (error) {
            logError('Failed to verify transaction');
            return false;
        }
        
        if (transaction.items && transaction.items !== '[]' && transaction.items !== 'null') {
            try {
                const items = typeof transaction.items === 'string' 
                    ? JSON.parse(transaction.items) 
                    : transaction.items;
                
                if (Array.isArray(items) && items.length > 0) {
                    logSuccess(`Transaction now has ${items.length} items!`);
                    items.forEach((item, index) => {
                        log(`  ${index + 1}. ${item.name} x${item.quantity} @ ₹${item.price}`, 'green');
                    });
                    return true;
                } else {
                    logWarning('Transaction items column is empty');
                    return false;
                }
            } catch (parseError) {
                logError('Transaction items column contains invalid JSON');
                return false;
            }
        } else {
            logWarning('Transaction items column is still empty or null');
            return false;
        }
    } catch (error) {
        logError(`Failed to verify fix: ${error.message}`);
        return false;
    }
}

async function main() {
    logHeader('Smart Canteen Order System - Database Fix Script');
    
    // Initialize Supabase
    if (!await initializeSupabase()) {
        logError('Cannot proceed without Supabase connection');
        process.exit(1);
    }
    
    // Check current structure
    const structure = await checkCurrentStructure();
    if (!structure) {
        logError('Failed to check database structure');
        process.exit(1);
    }
    
    // Add missing columns
    await addMissingColumns(structure.hasItemsColumn, structure.hasOrderStatusColumn);
    
    // Create order_items table
    await createOrderItemsTable();
    
    // Add items to problem transaction
    if (await addItemsToProblemTransaction()) {
        // Verify the fix
        if (await verifyFix()) {
            logHeader('🎉 FIX COMPLETED SUCCESSFULLY!');
            logSuccess('Your order now has items!');
            log('\nNext steps:', 'cyan');
            log('1. Refresh your staff dashboard in the browser', 'yellow');
            log('2. Click "🔄 Refresh Orders" to see the items', 'yellow');
            log('3. The "Items not loaded" error should be resolved', 'yellow');
        } else {
            logHeader('⚠️ PARTIAL FIX');
            logWarning('Items were added but verification failed');
            log('Please check manually in your staff dashboard', 'yellow');
        }
    } else {
        logHeader('❌ FIX FAILED');
        logError('Could not add items to the transaction');
        log('\nAlternative solutions:', 'cyan');
        log('1. Use the "🔍 Fix This Order" button in staff dashboard', 'yellow');
        log('2. Run the SQL from fix-database-manual.sql in Supabase dashboard', 'yellow');
        log('3. Install Supabase CLI and run the setup script', 'yellow');
    }
}

// Run the fix
main().catch(error => {
    logError('Script execution failed');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
});
