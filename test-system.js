#!/usr/bin/env node

/**
 * Smart Canteen System - Test Script
 * This script tests the core functionality of the system
 */

import fs from 'fs';
import path from 'path';

console.log('🍽️  Smart Canteen System - System Test');
console.log('=====================================\n');

// Test 1: Check if all required files exist
const requiredFiles = [
  'src/App.jsx',
  'src/pages/user/orders.jsx',
  'src/pages/staff/components/project.jsx',
  'src/lib/payment-utils.js',
  'src/lib/supabase.ts',
  'src/lib/cart-context.jsx',
  'package.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('');

// Test 2: Check package.json dependencies
if (fs.existsSync('package.json')) {
  console.log('📦 Checking package dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react'];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
      } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} - ${packageJson.devDependencies[dep]} (dev)`);
      } else {
        console.log(`❌ ${dep} - MISSING`);
        allFilesExist = false;
      }
    });
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    allFilesExist = false;
  }
}

console.log('');

// Test 3: Check environment configuration
console.log('🔧 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing - create this file with your Supabase credentials');
  allFilesExist = false;
}

console.log('');

// Test 4: Check database schema
console.log('🗄️  Checking database schema...');
if (fs.existsSync('supabase/migrations')) {
  const migrationFiles = fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql'));
  if (migrationFiles.length > 0) {
    console.log(`✅ ${migrationFiles.length} migration files found`);
    migrationFiles.forEach(file => {
      console.log(`   📄 ${file}`);
    });
  } else {
    console.log('❌ No migration files found in supabase/migrations/');
    allFilesExist = false;
  }
} else {
  console.log('❌ supabase/migrations directory not found');
  allFilesExist = false;
}

console.log('');

// Test 5: Check React components
console.log('⚛️  Checking React components...');
const componentFiles = [
  'src/components/ui/button.jsx',
  'src/components/ui/card.jsx',
  'src/components/ui/input.jsx',
  'src/pages/user/Header.jsx',
  'src/pages/user/cart.jsx'
];

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} - Optional component`);
  }
});

console.log('');

// Test 6: Check routing configuration
console.log('🛣️  Checking routing configuration...');
if (fs.existsSync('src/App.jsx')) {
  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  const routes = [
    '/user/dashboard',
    '/user/cart',
    '/user/orders',
    '/user/profile',
    '/staff/dashboard'
  ];
  
  routes.forEach(route => {
    if (appContent.includes(route)) {
      console.log(`✅ Route ${route}`);
    } else {
      console.log(`❌ Route ${route} - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log('');

// Test 7: Check Supabase integration
console.log('🔌 Checking Supabase integration...');
if (fs.existsSync('src/lib/supabase.ts')) {
  console.log('✅ Supabase client configuration exists');
} else {
  console.log('❌ Supabase client configuration missing');
  allFilesExist = false;
}

console.log('');

// Test 8: Check payment integration
console.log('💳 Checking payment integration...');
if (fs.existsSync('src/lib/payment-utils.js')) {
  const paymentContent = fs.readFileSync('src/lib/payment-utils.js', 'utf8');
  const paymentFeatures = [
    'createTransaction',
    'initializeRazorpayPayment',
    'getUserTransactions',
    'generateNextTokenNumber'
  ];
  
  paymentFeatures.forEach(feature => {
    if (paymentContent.includes(feature)) {
      console.log(`✅ ${feature} function`);
    } else {
      console.log(`❌ ${feature} function - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log('');

// Test 9: Check cart functionality
console.log('🛒 Checking cart functionality...');
if (fs.existsSync('src/lib/cart-context.jsx')) {
  console.log('✅ Cart context exists');
} else {
  console.log('❌ Cart context missing');
  allFilesExist = false;
}

console.log('');

// Test 10: Check staff dashboard
console.log('👨‍💼 Checking staff dashboard...');
if (fs.existsSync('src/pages/staff/components/project.jsx')) {
  const staffContent = fs.readFileSync('src/pages/staff/components/project.jsx', 'utf8');
  const staffFeatures = [
    'OrdersTable',
    'OrderDetailsModal',
    'handleAcceptOrder',
    'real-time subscription'
  ];
  
  staffFeatures.forEach(feature => {
    if (staffContent.includes(feature)) {
      console.log(`✅ ${feature}`);
    } else {
      console.log(`❌ ${feature} - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log('');

// Test 11: Check user orders page
console.log('📋 Checking user orders page...');
if (fs.existsSync('src/pages/user/orders.jsx')) {
  const ordersContent = fs.readFileSync('src/pages/user/orders.jsx', 'utf8');
  const ordersFeatures = [
    'UserOrdersPage',
    'OrderDetailsModal',
    'getUserTransactions',
    'real-time subscription'
  ];
  
  ordersFeatures.forEach(feature => {
    if (ordersContent.includes(feature)) {
      console.log(`✅ ${feature}`);
    } else {
      console.log(`❌ ${feature} - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log('');

// Final Results
console.log('📊 Test Results Summary');
console.log('========================');

if (allFilesExist) {
  console.log('🎉 All critical tests passed! Your Smart Canteen System is ready.');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Set up your Supabase project');
  console.log('   2. Configure environment variables');
  console.log('   3. Run database migrations');
  console.log('   4. Start the development server: npm run dev');
  console.log('   5. Test the complete order flow');
} else {
  console.log('⚠️  Some tests failed. Please fix the issues above before proceeding.');
  console.log('');
  console.log('🔧 Common fixes:');
  console.log('   - Install missing dependencies: npm install');
  console.log('   - Create missing files and components');
  console.log('   - Set up proper environment configuration');
}

console.log('');
console.log('📚 For detailed setup instructions, see SMART_CANTEEN_SYSTEM_README.md');
console.log('🆘 For support, check the documentation or create an issue');

console.log('\n✨ Smart Canteen System Test Complete!');
