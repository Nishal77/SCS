#!/usr/bin/env node

/**
 * Test Script for Smart Canteen Order System
 * This script tests the core functionality of the order system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
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

// Test configuration
const testConfig = {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    testTimeout: 10000
};

// Initialize Supabase client
let supabase;

async function initializeSupabase() {
    logHeader('Initializing Supabase Client');
    
    if (!testConfig.supabaseUrl || !testConfig.supabaseKey) {
        logError('Missing Supabase environment variables');
        log('Please check your .env file for:', 'yellow');
        log('  VITE_SUPABASE_URL', 'yellow');
        log('  VITE_SUPABASE_ANON_KEY', 'yellow');
        return false;
    }
    
    try {
        supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseKey);
        
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

async function testDatabaseStructure() {
    logHeader('Testing Database Structure');
    
    const tablesToTest = [
        'transactions',
        'order_items',
        'user_cart',
        'inventory'
    ];
    
    for (const tableName of tablesToTest) {
        try {
            logInfo(`Checking table: ${tableName}`);
            
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);
            
            if (error) {
                if (error.code === '42P01') {
                    logWarning(`Table ${tableName} does not exist`);
                } else {
                    logError(`Error accessing table ${tableName}: ${error.message}`);
                }
            } else {
                logSuccess(`Table ${tableName} is accessible`);
                
                // Check if table has data
                if (data && data.length > 0) {
                    log(`  - Has ${data.length} record(s)`, 'green');
                    log(`  - Columns: ${Object.keys(data[0]).join(', ')}`, 'green');
                } else {
                    log(`  - Table is empty`, 'yellow');
                }
            }
        } catch (error) {
            logError(`Failed to test table ${tableName}: ${error.message}`);
        }
    }
}

async function testTransactionsTable() {
    logHeader('Testing Transactions Table');
    
    try {
        // Check table structure
        const { data: sampleTransaction, error: structureError } = await supabase
            .from('transactions')
            .select('*')
            .limit(1)
            .single();
        
        if (structureError) {
            logError('Failed to access transactions table');
            log(`Error: ${structureError.message}`, 'red');
            return;
        }
        
        logSuccess('Transactions table is accessible');
        log(`Columns found: ${Object.keys(sampleTransaction).join(', ')}`, 'green');
        
        // Check for required columns
        const requiredColumns = ['id', 'user_id', 'total_amount', 'payment_status', 'order_number'];
        const missingColumns = requiredColumns.filter(col => !(col in sampleTransaction));
        
        if (missingColumns.length > 0) {
            logWarning(`Missing required columns: ${missingColumns.join(', ')}`);
        } else {
            logSuccess('All required columns are present');
        }
        
        // Check for items column
        if ('items' in sampleTransaction) {
            logSuccess('Items column exists');
            log(`Items column type: ${typeof sampleTransaction.items}`, 'green');
        } else {
            logWarning('Items column is missing - this may cause "Items not loaded" errors');
        }
        
    } catch (error) {
        logError(`Failed to test transactions table: ${error.message}`);
    }
}

async function testOrderItemsTable() {
    logHeader('Testing Order Items Table');
    
    try {
        const { data: sampleItems, error } = await supabase
            .from('order_items')
            .select('*')
            .limit(1);
        
        if (error) {
            if (error.code === '42P01') {
                logWarning('Order items table does not exist');
                log('This table is recommended for detailed item tracking', 'yellow');
            } else {
                logError(`Error accessing order_items table: ${error.message}`);
            }
            return;
        }
        
        logSuccess('Order items table is accessible');
        
        if (sampleItems && sampleItems.length > 0) {
            log(`Columns found: ${Object.keys(sampleItems[0]).join(', ')}`, 'green');
        }
        
    } catch (error) {
        logError(`Failed to test order items table: ${error.message}`);
    }
}

async function testSampleData() {
    logHeader('Testing Sample Data');
    
    try {
        // Check for existing transactions
        const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('id, order_number, total_amount, items, payment_status')
            .eq('payment_status', 'success')
            .limit(5);
        
        if (transactionError) {
            logError(`Failed to fetch transactions: ${transactionError.message}`);
            return;
        }
        
        if (!transactions || transactions.length === 0) {
            logWarning('No successful transactions found');
            log('You may need to create some test orders first', 'yellow');
            return;
        }
        
        logSuccess(`Found ${transactions.length} successful transaction(s)`);
        
        // Check each transaction for items
        for (const transaction of transactions) {
            logInfo(`Transaction: ${transaction.order_number}`);
            
            if (transaction.items && transaction.items !== '[]' && transaction.items !== 'null') {
                try {
                    const items = typeof transaction.items === 'string' 
                        ? JSON.parse(transaction.items) 
                        : transaction.items;
                    
                    if (Array.isArray(items) && items.length > 0) {
                        log(`  ✅ Has ${items.length} item(s)`, 'green');
                        items.forEach((item, index) => {
                            log(`    ${index + 1}. ${item.name || item.item_name} x${item.quantity}`, 'green');
                        });
                    } else {
                        log(`  ⚠️  Items column is empty`, 'yellow');
                    }
                } catch (parseError) {
                    log(`  ❌ Items column contains invalid JSON`, 'red');
                }
            } else {
                log(`  ⚠️  No items in transactions table`, 'yellow');
                
                // Try to get items from order_items table
                try {
                    const { data: orderItems, error: orderItemsError } = await supabase
                        .from('order_items')
                        .select('*')
                        .eq('transaction_id', transaction.id);
                    
                    if (!orderItemsError && orderItems && orderItems.length > 0) {
                        log(`  ✅ Found ${orderItems.length} item(s) in order_items table`, 'green');
                    } else {
                        log(`  ❌ No items found in order_items table`, 'red');
                    }
                } catch (e) {
                    log(`  ❌ Could not check order_items table`, 'red');
                }
            }
        }
        
    } catch (error) {
        logError(`Failed to test sample data: ${error.message}`);
    }
}

async function runTests() {
    logHeader('Smart Canteen Order System - System Test');
    
    // Initialize Supabase
    if (!await initializeSupabase()) {
        logError('Cannot proceed without Supabase connection');
        process.exit(1);
    }
    
    // Run tests
    await testDatabaseStructure();
    await testTransactionsTable();
    await testOrderItemsTable();
    await testSampleData();
    
    logHeader('Test Summary');
    logSuccess('System test completed');
    log('\nNext steps:', 'cyan');
    log('1. If you see warnings about missing tables, run the setup script', 'yellow');
    log('2. If you see "Items not loaded" errors, check the database structure', 'yellow');
    log('3. Use the debug buttons in the staff dashboard for interactive testing', 'yellow');
    log('4. Check the ORDER_SYSTEM_README.md for detailed troubleshooting', 'yellow');
}

// Run the tests
runTests().catch(error => {
    logError('Test execution failed');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
});
