# Cart Functionality & Stock Validation System

## Overview
This document describes the implementation of a comprehensive cart system with real-time stock validation for the Smart Canteen System.

## Features Implemented

### 1. **Stock-Aware Add to Cart**
- **Real-time Stock Checking**: Before adding items to cart, the system checks current stock availability
- **Stock Validation**: Prevents adding items when stock is insufficient or out of stock
- **Dynamic Stock Updates**: Stock levels are updated in real-time across all components

### 2. **Enhanced Cart Management**
- **Database Integration**: Cart items are stored in a dedicated `user_cart` table
- **User Authentication**: Cart is tied to authenticated users with proper security
- **Quantity Management**: Users can increase/decrease quantities with stock validation
- **Real-time Updates**: Cart reflects changes immediately across all components

### 3. **Stock Validation Rules**
- **Out of Stock**: Items with `stock_available <= 0` cannot be added to cart
- **Quantity Limits**: Cannot add more items than available stock
- **Real-time Checks**: Stock is validated on every cart operation
- **User Feedback**: Clear messages for stock-related issues

## Database Schema

### User Cart Table (`user_cart`)
```sql
CREATE TABLE user_cart (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id UUID REFERENCES inventory(id),
    quantity INTEGER CHECK (quantity > 0),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, product_id)
);
```

### Inventory Table Updates
- `stock_available`: Current available stock
- `stock_constant`: Maximum stock level
- Real-time updates via Supabase subscriptions

## Components Updated

### 1. **RestaurantList.jsx**
- **Stock Validation**: Add to cart only works when stock > 0
- **Real-time Updates**: Stock changes reflect immediately
- **User Feedback**: Success/error messages for cart operations
- **Loading States**: Visual feedback during cart operations

### 2. **TodaysSpecial.jsx**
- **Stock Validation**: Same stock checking as RestaurantList
- **Cart Integration**: Seamless add to cart functionality
- **Real-time Sync**: Stock updates across all components

### 3. **Cart.jsx**
- **Real Cart Data**: Uses database instead of mock data
- **Stock Display**: Shows available stock for each item
- **Quantity Management**: Update/remove items with stock validation
- **Loading States**: Proper loading and error handling

## Cart Utilities (`src/lib/cart-utils.js`)

### Key Functions
- `addToCart(userId, productId, quantity)`: Add item with stock validation
- `checkStockAvailability(productId, quantity)`: Check if stock is sufficient
- `updateCartItemQuantity(cartItemId, newQuantity)`: Update quantity with validation
- `removeFromCart(cartItemId)`: Remove item from cart
- `getCartItems(userId)`: Fetch user's cart items

### Stock Validation Logic
```javascript
// Check stock before adding to cart
const stockCheck = await checkStockAvailability(productId, quantity);

if (!stockCheck.canAdd) {
    return { success: false, error: 'Product is out of stock' };
}

if (!stockCheck.available) {
    return { success: false, error: `Insufficient stock. Only ${stockCheck.stockAvailable} available.` };
}
```

## User Experience Features

### 1. **Visual Feedback**
- **Success Messages**: ✅ Green confirmation when items are added
- **Error Messages**: ❌ Red alerts for stock issues
- **Loading States**: "ADDING..." text during cart operations
- **Stock Indicators**: Shows available stock for each product

### 2. **Button States**
- **Available**: Amber border, "ADD" text, clickable
- **Out of Stock**: Gray border, "OUT OF STOCK" text, disabled
- **Adding**: Loading state, disabled during operation

### 3. **Real-time Updates**
- **Stock Changes**: Immediate reflection when staff updates inventory
- **Cart Sync**: Cart updates across all components
- **Price Updates**: Real-time price synchronization

## Security Features

### 1. **Row Level Security (RLS)**
- Users can only access their own cart items
- Proper authentication checks before cart operations
- Secure database policies

### 2. **Input Validation**
- Quantity must be positive and reasonable (1-100)
- Stock validation on every operation
- SQL injection prevention via Supabase

## Error Handling

### 1. **Stock-Related Errors**
- "Product is out of stock"
- "Insufficient stock. Only X available."
- "Cannot add more. Total quantity would exceed available stock."

### 2. **Authentication Errors**
- "Authentication required"
- "Session expired. Please login again."
- "Failed to add item to cart"

### 3. **Network Errors**
- "Failed to load cart items"
- "Error updating cart item"
- Graceful fallbacks and retry mechanisms

## Testing Scenarios

### 1. **Stock Validation**
- Try to add item with 0 stock → Should show "OUT OF STOCK"
- Try to add more than available stock → Should show insufficient stock message
- Add item successfully → Should show success message and update stock

### 2. **Cart Operations**
- Add item to cart → Should appear in cart immediately
- Update quantity → Should validate against available stock
- Remove item → Should update cart and free up stock

### 3. **Real-time Updates**
- Staff updates inventory → Should reflect in user components
- Stock changes → Should update add to cart buttons
- Price changes → Should update display immediately

## Future Enhancements

### 1. **Advanced Stock Management**
- Low stock warnings
- Stock reservation system
- Automatic stock replenishment alerts

### 2. **Cart Features**
- Save cart for later
- Share cart with friends
- Cart history and analytics

### 3. **User Experience**
- Stock notifications
- Favorite items
- Personalized recommendations

## Database Migration

To apply the cart system, run the migration:
```bash
# Apply the cart table migration
supabase db push

# Or manually run the SQL in Supabase dashboard
# File: supabase/migrations/20250728154622_create_user_cart_table.sql
```

## Troubleshooting

### Common Issues
1. **Cart not loading**: Check user authentication and session
2. **Stock not updating**: Verify Supabase real-time subscriptions
3. **Add to cart failing**: Check stock availability and user permissions

### Debug Information
- Check browser console for error messages
- Verify Supabase connection and policies
- Check database constraints and foreign keys

## Conclusion

The cart functionality with stock validation provides a robust, user-friendly shopping experience that ensures data integrity and real-time synchronization across all components. The system prevents overselling, provides clear user feedback, and maintains consistency between staff inventory management and user ordering interfaces.
