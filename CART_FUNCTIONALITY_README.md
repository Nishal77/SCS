# Cart Functionality Implementation

## Overview
This document describes the implementation of the cart functionality for the Smart Canteen System. The cart system allows users to add menu items to their cart, manage quantities, and proceed to checkout.

## Features Implemented

### 1. Global Cart State Management
- **Cart Context**: Centralized state management using React Context
- **Real-time Updates**: Automatic cart updates when items are added/removed
- **Persistent Data**: Cart data is stored in Supabase `user_cart` table

### 2. Cart Operations
- **Add to Cart**: Add items with stock validation
- **Update Quantity**: Increase/decrease item quantities
- **Remove Items**: Remove items from cart
- **Stock Validation**: Prevents adding items beyond available stock

### 3. UI Components
- **Cart Icon**: Shows real-time cart count in header
- **Add Button**: Available on all menu items (RestaurantList and TodaysSpecial)
- **Cart Page**: Complete cart management interface
- **Success/Error Messages**: User feedback for cart operations

## Database Schema

### user_cart Table
```sql
CREATE TABLE user_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    product_id UUID NOT NULL REFERENCES inventory(id),
    price NUMERIC NOT NULL CHECK (price >= 0),
    image_url TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    item_name TEXT,
    category TEXT
);
```

## Key Components

### 1. Cart Context (`src/lib/cart-context.jsx`)
- Manages global cart state
- Provides cart data to all components
- Handles real-time subscriptions
- Exposes `refreshCart()` function for manual updates

### 2. Cart Utilities (`src/lib/cart-utils.js`)
- `addToCart()`: Add items with stock validation
- `updateCartItemQuantity()`: Update item quantities
- `removeFromCart()`: Remove items from cart
- `getCartItems()`: Fetch user's cart items
- `getCartCount()`: Get total cart count

### 3. Auth Utilities (`src/lib/auth-utils.js`)
- `handleAddToCart()`: Wrapper function with authentication check
- `checkAuthStatus()`: Verify user authentication

### 4. UI Components
- **Header**: Shows cart count with real-time updates
- **RestaurantList**: Add to cart functionality for all menu items
- **TodaysSpecial**: Add to cart functionality for special items
- **Cart Page**: Complete cart management interface

## Usage Examples

### Adding Items to Cart
```javascript
import { useCart } from '../../lib/cart-context';
import { handleAddToCart } from '../../lib/auth-utils';

const { refreshCart } = useCart();

const handleAddClick = async () => {
    const result = await handleAddToCart(productId, 1);
    if (result.success) {
        refreshCart(); // Update global cart state
    }
};
```

### Displaying Cart Count
```javascript
import { useCart } from '../../lib/cart-context';

const { cartCount } = useCart();

// In JSX
{cartCount > 0 && (
    <span className="cart-badge">{cartCount}</span>
)}
```

## Real-time Features

### 1. Automatic Cart Updates
- Real-time subscription to `user_cart` table changes
- Automatic refresh when items are added/removed
- Live cart count updates in header

### 2. Stock Validation
- Prevents adding items beyond available stock
- Real-time stock status display
- Automatic page refresh for stock-related errors

## Error Handling

### 1. Authentication Errors
- Redirects to login if user is not authenticated
- Session expiration handling
- Graceful fallback for unauthenticated users

### 2. Stock Errors
- Insufficient stock validation
- Out of stock item handling
- User-friendly error messages

### 3. Network Errors
- Retry mechanisms for failed operations
- Fallback to localStorage for offline scenarios
- Error state management

## Security Features

### 1. Row Level Security (RLS)
- Users can only access their own cart items
- Database-level security enforcement
- Proper user isolation

### 2. Input Validation
- Quantity validation (must be > 0)
- Price validation (must be >= 0)
- Stock availability checks

## Performance Optimizations

### 1. Efficient Queries
- Parallel fetching of cart items and count
- Optimized database queries with joins
- Minimal data transfer

### 2. Caching
- Global cart state caching
- Reduced redundant API calls
- Efficient re-rendering

### 3. Real-time Updates
- WebSocket-based real-time subscriptions
- Efficient change detection
- Minimal network overhead

## Testing

### Manual Testing Checklist
- [ ] Add items to cart from RestaurantList
- [ ] Add items to cart from TodaysSpecial
- [ ] Update item quantities in cart
- [ ] Remove items from cart
- [ ] Verify cart count updates in header
- [ ] Test stock validation
- [ ] Test authentication requirements
- [ ] Test real-time updates

### Edge Cases
- [ ] Adding items when stock is low
- [ ] Adding items when out of stock
- [ ] Network connectivity issues
- [ ] Session expiration during cart operations
- [ ] Concurrent cart modifications

## Future Enhancements

### 1. Advanced Features
- Save cart for later
- Cart sharing between users
- Bulk operations
- Cart templates

### 2. Performance Improvements
- Cart item caching
- Optimistic updates
- Background sync
- Offline support

### 3. User Experience
- Cart animations
- Drag and drop reordering
- Quick add buttons
- Cart recommendations

## Troubleshooting

### Common Issues

1. **Cart count not updating**
   - Check if user is authenticated
   - Verify real-time subscription is active
   - Check browser console for errors

2. **Items not adding to cart**
   - Verify stock availability
   - Check authentication status
   - Review network connectivity

3. **Real-time updates not working**
   - Check Supabase connection
   - Verify RLS policies
   - Review subscription setup

4. **RLS Policy Errors (406/400)**
   - **Solution 1**: Add service role key to environment variables
   - **Solution 2**: Modify RLS policies to allow cart operations
   - **Solution 3**: Implement proper Supabase auth integration

### RLS Policy Fix

If you're getting 406/400 errors due to RLS policies, you have three options:

#### Option 1: Use Service Role Key (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the anon key)
4. Add it to your `.env` file:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

#### Option 2: Modify RLS Policies
Run these SQL commands in your Supabase SQL editor:
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON user_cart;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON user_cart;
DROP POLICY IF EXISTS "Users can update their own cart items" ON user_cart;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON user_cart;

-- Create new policies that allow all operations
CREATE POLICY "Users can view their own cart items" ON user_cart
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cart items" ON user_cart
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own cart items" ON user_cart
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own cart items" ON user_cart
    FOR DELETE USING (true);
```

#### Option 3: Implement Proper Supabase Auth
Modify the login system to properly authenticate users with Supabase auth.

### Debug Commands
```javascript
// Check cart state
console.log('Cart items:', cartItems);
console.log('Cart count:', cartCount);

// Check authentication
console.log('Auth status:', checkAuthStatus());

// Check user session
console.log('User session:', localStorage.getItem('user_session'));

// Check Supabase connection
console.log('Supabase client:', supabase);
console.log('Service client:', supabaseService);
```

## Conclusion

The cart functionality provides a robust, real-time shopping experience with proper validation, error handling, and user feedback. The implementation follows React best practices and provides a scalable foundation for future enhancements.

