// Debug Real-time Script
// Run this to test if Supabase real-time is working

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Real-time...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '***' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n📡 Testing Supabase connection...');

// Test basic connection
supabase.from('transactions').select('count').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
  console.log('✅ Connection successful');
  
  // Test real-time subscription
  console.log('\n📡 Testing real-time subscription...');
  
  const subscription = supabase
    .channel('debug_test')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions'
      },
      (payload) => {
        console.log('🔔 Real-time event received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription successful!');
        console.log('🎯 Now try updating an order in your database...');
        
        // Keep the script running to test real-time
        console.log('⏳ Waiting for real-time events... (Press Ctrl+C to stop)');
      } else {
        console.log('❌ Real-time subscription failed:', status);
      }
    });
    
  // Test manual update after 5 seconds
  setTimeout(() => {
    console.log('\n🧪 Testing manual update...');
    console.log('This will help verify if the issue is with real-time or the update logic');
  }, 5000);
});

console.log('\n💡 If real-time is not working, check:');
console.log('1. Supabase project settings - enable real-time');
console.log('2. Database policies - ensure RLS allows real-time');
console.log('3. Network connectivity - no firewall blocking WebSocket');
console.log('4. Browser console - check for WebSocket errors');
