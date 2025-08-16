import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    console.error('Current values:', { supabaseUrl, supabaseKey: supabaseKey ? '***' : 'undefined' });
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create service role client for cart operations (bypasses RLS)
const supabaseService = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// Test connection
supabase.from('inventory').select('count').limit(1).then(({ data, error }) => {
    if (error) {
        console.error('❌ Supabase connection failed:', error);
    } else {
        console.log('✅ Supabase connection successful');
    }
});

export default supabase;
export { supabaseService }; 