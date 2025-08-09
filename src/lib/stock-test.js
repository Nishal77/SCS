// Test file to demonstrate stock checking functionality
import { getStockStatus } from './image-utils';

// Test cases for stock status
export const testStockStatus = () => {
    console.log('Testing stock status functionality...');
    
    // Test case 1: Out of stock
    const outOfStock = getStockStatus(0);
    console.log('Out of stock (0):', outOfStock);
    
    // Test case 2: Low stock
    const lowStock = getStockStatus(3);
    console.log('Low stock (3):', lowStock);
    
    // Test case 3: In stock
    const inStock = getStockStatus(15);
    console.log('In stock (15):', inStock);
    
    // Test case 4: Negative stock (edge case)
    const negativeStock = getStockStatus(-5);
    console.log('Negative stock (-5):', negativeStock);
    
    // Test case 5: Undefined stock (edge case)
    const undefinedStock = getStockStatus(undefined);
    console.log('Undefined stock:', undefinedStock);
    
    return {
        outOfStock,
        lowStock,
        inStock,
        negativeStock,
        undefinedStock
    };
};

// Test the stock validation logic
export const testStockValidation = () => {
    console.log('Testing stock validation logic...');
    
    const testCases = [
        { stock: 0, expected: false, description: 'Zero stock' },
        { stock: 1, expected: true, description: 'One item in stock' },
        { stock: 5, expected: true, description: 'Five items in stock' },
        { stock: 10, expected: true, description: 'Ten items in stock' },
        { stock: 15, expected: true, description: 'Fifteen items in stock' },
        { stock: -1, expected: false, description: 'Negative stock' },
        { stock: null, expected: false, description: 'Null stock' },
        { stock: undefined, expected: false, description: 'Undefined stock' }
    ];
    
    testCases.forEach(testCase => {
        const result = getStockStatus(testCase.stock);
        const passed = result.canOrder === testCase.expected;
        console.log(`${testCase.description}: ${passed ? '✅ PASS' : '❌ FAIL'} (Stock: ${testCase.stock}, Expected: ${testCase.expected}, Got: ${result.canOrder})`);
    });
};

// Export test functions
export default {
    testStockStatus,
    testStockValidation
};
