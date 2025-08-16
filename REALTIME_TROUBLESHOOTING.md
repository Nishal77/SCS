# 🔍 Real-Time Troubleshooting Guide

## 🚨 Issue: Real-time updates not working between staff and user dashboards

### 🔍 **Step 1: Check Supabase Real-time Configuration**

#### **1.1 Enable Real-time in Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Ensure **Real-time** is **ENABLED**
4. If disabled, click **Enable** and wait for it to activate

#### **1.2 Check Database Policies**
```sql
-- Check if RLS is blocking real-time
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'transactions';

-- Should return: rowsecurity = true
```

#### **1.3 Verify Table Permissions**
```sql
-- Check if the transactions table allows real-time
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'transactions';
```

### 🔍 **Step 2: Test Real-time Manually**

#### **2.1 Run Debug Script**
```bash
node debug-realtime.js
```

#### **2.2 Check Browser Console**
1. Open staff dashboard in one tab
2. Open user orders page in another tab
3. Check browser console for real-time messages
4. Look for WebSocket connection errors

#### **2.3 Test Database Update**
```sql
-- Manually update an order to test real-time
UPDATE transactions 
SET order_status = 'Accepted', updated_at = NOW()
WHERE id = 'your-order-id';

-- Check if real-time event is received
```

### 🔍 **Step 3: Common Issues & Solutions**

#### **Issue 1: Real-time not enabled**
```
❌ Error: Real-time is not enabled for this project
✅ Solution: Enable real-time in Supabase dashboard
```

#### **Issue 2: RLS blocking real-time**
```
❌ Error: Permission denied for table transactions
✅ Solution: Check RLS policies and ensure they allow real-time
```

#### **Issue 3: WebSocket connection failed**
```
❌ Error: WebSocket connection failed
✅ Solution: Check network/firewall settings
```

#### **Issue 4: Subscription not receiving events**
```
❌ Error: No real-time events received
✅ Solution: Verify table name, schema, and event types
```

### 🔍 **Step 4: Debug Real-time Subscription**

#### **4.1 Enhanced Logging**
The code now includes comprehensive logging:
- 🔔 Real-time events received
- 📡 Subscription status
- ✅ Order status changes
- 🔄 UI updates

#### **4.2 Test Buttons Added**
- **Staff Dashboard**: Yellow "🧪 Test Real-time" button
- **User Orders Page**: Yellow "🧪 Test Real-time" button

#### **4.3 Manual Testing Steps**
1. Click "🧪 Test Real-time" on staff dashboard
2. Watch console for real-time events
3. Check if user page receives updates
4. Verify notifications appear

### 🔍 **Step 5: Alternative Solutions**

#### **5.1 Polling Fallback**
If real-time continues to fail, implement polling:
```javascript
// Poll for updates every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchUserOrders(userData.id);
  }, 5000);
  
  return () => clearInterval(interval);
}, [userData]);
```

#### **5.2 WebSocket Status Check**
```javascript
// Check WebSocket connection status
const checkWebSocketStatus = () => {
  const ws = new WebSocket('wss://your-project.supabase.co');
  ws.onopen = () => console.log('✅ WebSocket connected');
  ws.onerror = (error) => console.log('❌ WebSocket error:', error);
};
```

### 🔍 **Step 6: Verification Checklist**

- [ ] Real-time enabled in Supabase dashboard
- [ ] RLS policies allow real-time access
- [ ] WebSocket connections successful
- [ ] Real-time events received in console
- [ ] Staff dashboard updates trigger events
- [ ] User page receives real-time updates
- [ ] Notifications appear without refresh
- [ ] Order status changes visible immediately

### 🔍 **Step 7: Get Help**

If issues persist:
1. Check Supabase status page
2. Review Supabase real-time documentation
3. Check browser console for specific errors
4. Verify environment variables are correct
5. Test with a simple real-time subscription

### 🎯 **Expected Behavior**

When working correctly:
1. **Staff accepts order** → Real-time event sent
2. **User page receives event** → UI updates immediately
3. **Notification appears** → Status change visible
4. **No page refresh needed** → Everything works live

### 🚀 **Quick Fix Commands**

```bash
# Test real-time connection
node debug-realtime.js

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Restart development server
npm run dev
```

---

**Remember**: Real-time requires proper Supabase configuration and network connectivity. The debugging tools will help identify exactly where the issue lies.
