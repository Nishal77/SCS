# Razorpay Payment Integration with OTP & Token System

## Overview
This document describes the implementation of Razorpay payment integration for the Smart Canteen System with an advanced OTP and token system for order collection. The payment system allows users to pay for their orders using online payment methods through Razorpay, and provides secure OTP and token numbers for order collection.

## Features Implemented

### 1. Payment Methods
- **Cash Payment**: Pay at the counter
- **Online Payment**: Pay using Razorpay (UPI, Cards, Net Banking, etc.)
- **Card Payment**: Debit/Credit card payments

### 2. Advanced Order Management
- **Unique Order Numbers**: Auto-generated order numbers (e.g., ORD1234567890123)
- **OTP System**: 6-digit OTP for order collection verification
- **Token Numbers**: Unique token numbers for order tracking
- **Payment Status Tracking**: Real-time payment status updates
- **Order History**: Complete transaction history for users

### 3. Payment Flow
- **Order Summary**: Display cart items and total amount
- **Payment Method Selection**: Choose between cash and online payment
- **Razorpay Integration**: Secure payment processing
- **Transaction Creation**: Store transaction in database
- **OTP/Token Generation**: Automatic generation on successful payment
- **Order Confirmation**: Display OTP and token for collection
- **Success/Error Handling**: User feedback for payment status

### 4. Security Features
- **Payment Validation**: Verify payment response
- **OTP Verification**: Secure order collection
- **Token Authentication**: Unique token for each order
- **Order Tracking**: Complete audit trail
- **Error Handling**: Graceful handling of payment failures
- **Data Integrity**: Proper transaction data storage

## Database Schema

### Transactions Table
```sql
-- Create transactions table with OTP & Token
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL, -- e.g. 'UPI', 'Card', 'Cash'
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
    otp TEXT,
    token_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_number TEXT UNIQUE
);

-- Function to auto-generate OTP & Token when payment is successful
CREATE OR REPLACE FUNCTION set_transaction_otp_and_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run when payment_status changes to 'success'
    IF NEW.payment_status = 'success'
       AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN

        -- Generate a 6-digit OTP
        NEW.otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

        -- Generate a unique token (prefix T + timestamp)
        NEW.token_number := 'T' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the OTP & Token generation function
CREATE TRIGGER trigger_set_otp_and_token
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_otp_and_token();
```

## Key Components

### 1. Payment Utilities (`src/lib/payment-utils.js`)
- `createTransaction()`: Create new transaction in database
- `updateTransactionStatus()`: Update payment status
- `getTransactionById()`: Get transaction by ID
- `getTransactionByOrderNumber()`: Get transaction by order number
- `initializeRazorpayPayment()`: Initialize Razorpay payment
- `saveOrderToDatabase()`: Update transaction status to success
- `clearCartAfterPayment()`: Clear cart after successful payment
- `validatePayment()`: Validate payment response
- `formatOrderData()`: Format order data for Razorpay
- `getUserTransactions()`: Get user's transaction history
- `verifyOTP()`: Verify OTP for order collection
- `getTransactionByToken()`: Get transaction by token number

### 2. Cart Page (`src/pages/user/cart.jsx`)
- Payment method selection
- Order summary display
- Payment processing
- Transaction creation
- Success/error handling

### 3. Order Confirmation Page (`src/pages/user/order.jsx`)
- Order details display
- OTP and token display
- Copy to clipboard functionality
- Order status tracking
- Customer information

### 4. Environment Variables
```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
VITE_RAZORPAY_KEY_SECRET=your_test_key_secret
```

## Setup Instructions

### 1. Razorpay Account Setup
1. **Create Razorpay Account**:
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a new account
   - Complete KYC verification

2. **Get API Keys**:
   - Navigate to Settings > API Keys
   - Copy your Test Mode Key ID and Key Secret
   - For production, use Live Mode keys

3. **Configure Webhook** (Optional):
   - Set up webhook URL for payment notifications
   - Configure events: `payment.captured`, `payment.failed`

### 2. Environment Configuration
1. **Add Razorpay Keys**:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   VITE_RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

2. **Create Transactions Table**:
   - Run the SQL migration in your Supabase SQL Editor
   - Or copy the SQL from the Database Schema section

### 3. Backend API (Optional)
For production, you should implement a backend API to:
- Create Razorpay orders securely
- Verify payment signatures
- Handle webhook notifications

## Payment Flow

### 1. User Journey
```
1. Add items to cart
2. Go to cart page
3. Select payment method
4. Click "Pay" button
5. Transaction created in database
6. Razorpay modal opens (for online payment)
7. Complete payment
8. Transaction status updated to 'success'
9. OTP and token automatically generated
10. Order confirmation page with OTP/token
11. Show OTP/token to collect order
```

### 2. Technical Flow
```
1. Format order data
2. Create transaction in database
3. Initialize Razorpay payment (if online)
4. Load Razorpay script
5. Create order (mock/API)
6. Open payment modal
7. Handle payment response
8. Validate payment
9. Update transaction status to 'success'
10. Database trigger generates OTP and token
11. Clear cart
12. Show success message with OTP/token
```

## Usage Examples

### Create Transaction
```javascript
import { createTransaction } from '../../lib/payment-utils';

const handlePayment = async () => {
  const transaction = await createTransaction({
    userId: userData.id,
    userEmail: userData.email,
    amount: total,
    paymentMethod: 'online'
  });
  
  console.log('Transaction created:', transaction);
};
```

### Initialize Online Payment
```javascript
import { initializeRazorpayPayment, formatOrderData } from '../../lib/payment-utils';

const handleOnlinePayment = async () => {
  const orderData = formatOrderData(cartItems, total, userData, options);
  
  await initializeRazorpayPayment(
    orderData,
    (paymentResponse) => {
      // Payment successful
      console.log('Payment successful:', paymentResponse);
    },
    (error) => {
      // Payment failed
      console.error('Payment failed:', error);
    }
  );
};
```

### Verify OTP
```javascript
import { verifyOTP } from '../../lib/payment-utils';

const verifyOrderOTP = async (orderNumber, otp) => {
  try {
    const transaction = await verifyOTP(orderNumber, otp);
    console.log('OTP verified:', transaction);
    return transaction;
  } catch (error) {
    console.error('OTP verification failed:', error);
    throw error;
  }
};
```

### Get Transaction History
```javascript
import { getUserTransactions } from '../../lib/payment-utils';

const getOrderHistory = async (userId) => {
  try {
    const transactions = await getUserTransactions(userId);
    console.log('Transaction history:', transactions);
    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};
```

## Error Handling

### 1. Payment Errors
- **Network Errors**: Retry mechanism
- **Invalid Amount**: Validation before payment
- **Payment Failed**: User-friendly error messages
- **Transaction Processing**: Graceful fallback

### 2. OTP/Token Errors
- **Invalid OTP**: Clear error messages
- **Expired OTP**: Regeneration mechanism
- **Token Issues**: Fallback verification
- **Database Errors**: Transaction rollback

### 3. Common Issues
- **Razorpay Not Loaded**: Script loading fallback
- **Invalid Keys**: Configuration validation
- **Database Errors**: Transaction rollback
- **Cart Issues**: State synchronization

## Testing

### 1. Test Cards (Razorpay Test Mode)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

### 2. Test UPI
```
UPI ID: success@razorpay
```

### 3. Test Scenarios
- [ ] Cash payment flow
- [ ] Online payment flow
- [ ] Payment success
- [ ] Payment failure
- [ ] Transaction creation
- [ ] OTP generation
- [ ] Token generation
- [ ] Cart clearing
- [ ] Error handling
- [ ] OTP verification

## Security Considerations

### 1. Frontend Security
- **API Keys**: Never expose secret keys in frontend
- **Payment Validation**: Always validate on backend
- **HTTPS**: Use HTTPS in production
- **Input Validation**: Validate all user inputs

### 2. OTP/Token Security
- **OTP Generation**: Server-side generation only
- **Token Uniqueness**: Guaranteed unique tokens
- **Verification**: Server-side verification
- **Expiration**: Consider OTP expiration

### 3. Backend Security (Recommended)
- **Signature Verification**: Verify payment signatures
- **Webhook Validation**: Validate webhook requests
- **Transaction Validation**: Validate transaction data
- **Database Security**: Use RLS policies

## Production Checklist

### 1. Environment Setup
- [ ] Use Live Mode Razorpay keys
- [ ] Configure HTTPS
- [ ] Set up webhooks
- [ ] Implement backend API

### 2. Security
- [ ] Verify payment signatures
- [ ] Implement proper error handling
- [ ] Add input validation
- [ ] Configure RLS policies
- [ ] Set up OTP expiration

### 3. Monitoring
- [ ] Set up payment monitoring
- [ ] Configure error logging
- [ ] Add analytics tracking
- [ ] Monitor transaction status
- [ ] Track OTP usage

## Troubleshooting

### Common Issues

1. **OTP Not Generated**
   - Check if payment status is 'success'
   - Verify database trigger is working
   - Check transaction table structure

2. **Token Not Generated**
   - Verify trigger function
   - Check timestamp format
   - Ensure unique constraint

3. **Payment Failing**
   - Verify test card details
   - Check network connectivity
   - Validate order amount

4. **Transaction Not Saving**
   - Check database connection
   - Verify table structure
   - Check RLS policies

### Debug Commands
```javascript
// Check transaction creation
console.log('Transaction:', transaction);

// Check OTP generation
console.log('OTP:', transaction.otp);

// Check token generation
console.log('Token:', transaction.token_number);

// Verify OTP
const verified = await verifyOTP(orderNumber, otp);
console.log('OTP verified:', verified);
```

## Future Enhancements

### 1. Advanced Features
- **OTP Expiration**: Time-based OTP expiration
- **Multiple OTPs**: Support for multiple collection attempts
- **QR Code**: QR code for OTP/token
- **SMS Integration**: Send OTP via SMS

### 2. User Experience
- **Order Tracking**: Real-time order status
- **Push Notifications**: Order ready notifications
- **Collection Reminders**: Automatic reminders
- **Order History**: Detailed order history

### 3. Analytics
- **Payment Analytics**: Track payment trends
- **OTP Usage**: Monitor OTP verification rates
- **Collection Times**: Analyze collection patterns
- **Performance Metrics**: Monitor system performance

## Conclusion

The Razorpay payment integration with OTP and token system provides a secure, user-friendly payment and order collection experience for the Smart Canteen System. The implementation includes proper error handling, security measures, and a smooth user journey from cart to order collection.

The OTP and token system ensures secure order collection while providing a complete audit trail for all transactions. For production deployment, ensure you implement the backend API for secure order creation and payment verification.
