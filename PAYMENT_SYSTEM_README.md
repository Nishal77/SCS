# Smart Canteen Payment System

## Overview
A comprehensive payment system for the Smart Canteen with Razorpay integration, OTP/token generation, and modular architecture. The system provides a seamless payment experience with multiple payment methods and secure order collection.

## Architecture

### 1. Payment Service (`src/services/PaymentService.js`)
**Central payment orchestration service**

#### Key Features:
- **Singleton Pattern**: Single instance manages all payment operations
- **State Management**: Prevents concurrent payment processing
- **Method Validation**: Validates payment method availability
- **Error Handling**: Comprehensive error management
- **Transaction Management**: Handles transaction lifecycle

#### Core Methods:
```javascript
// Initialize payment process
await paymentService.initializePayment(params)

// Process online payment
await paymentService.processOnlinePayment(params)

// Process cash payment
await paymentService.processCashPayment(params)

// Process card payment
await paymentService.processCardPayment(params)

// Get payment method details
paymentService.getPaymentMethodDetails(method)

// Validate payment method
paymentService.validatePaymentMethod(method)
```

### 2. Payment Modal (`src/components/PaymentModal.jsx`)
**User interface for payment processing**

#### Features:
- **Modal Interface**: Clean, responsive payment modal
- **Method Selection**: Visual payment method selection
- **Real-time Validation**: Dynamic validation based on configuration
- **Success/Error Handling**: User-friendly feedback
- **OTP/Token Display**: Secure order collection details
- **Copy Functionality**: Easy copying of OTP and token

#### Props:
```javascript
{
  isOpen: boolean,           // Modal visibility
  onClose: function,         // Close modal callback
  cartItems: array,          // Cart items
  total: number,             // Total amount
  userData: object,          // User information
  options: object,           // Additional options
  onPaymentSuccess: function, // Success callback
  onPaymentError: function   // Error callback
}
```

### 3. Payment Utilities (`src/lib/payment-utils.js`)
**Core payment functionality and database operations**

#### Key Functions:
- **Transaction Management**: Create, update, retrieve transactions
- **Razorpay Integration**: Initialize and handle Razorpay payments
- **Order Data Formatting**: Format data for payment processing
- **Cart Operations**: Clear cart after successful payment
- **OTP/Token Verification**: Verify order collection credentials

## Payment Flow

### 1. User Journey
```
1. User adds items to cart
2. Clicks "Proceed to Payment" button
3. Payment modal opens
4. Selects payment method (Cash/Online/Card)
5. Clicks "Pay" button
6. Payment processing begins
7. For online payment: Razorpay modal opens
8. Payment completion
9. OTP and token generated automatically
10. Success screen with order details
11. User can copy OTP/token for collection
```

### 2. Technical Flow
```
1. PaymentService.initializePayment()
   ├── Validate inputs
   ├── Format order data
   └── Create initial transaction

2. PaymentService.process[Method]Payment()
   ├── Update transaction method
   ├── Process payment (Razorpay/Cash)
   ├── Update transaction status
   ├── Generate OTP/token (via database trigger)
   ├── Clear cart
   └── Call success callback

3. UI Updates
   ├── Show success message
   ├── Display OTP and token
   ├── Enable copy functionality
   └── Provide navigation options
```

## Database Integration

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    otp TEXT,
    token_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_number TEXT UNIQUE
);
```

### Automatic OTP/Token Generation
```sql
-- Trigger function
CREATE OR REPLACE FUNCTION set_transaction_otp_and_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'success' 
       AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN
        NEW.otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        NEW.token_number := 'T' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Payment Methods

### 1. Cash Payment
- **Process**: Direct transaction creation
- **Status**: Immediately marked as 'success'
- **OTP/Token**: Generated automatically
- **Collection**: Pay at counter with OTP/token

### 2. Online Payment (Razorpay)
- **Process**: Razorpay integration
- **Methods**: UPI, Cards, Net Banking, Wallets
- **Security**: Server-side validation
- **Status**: Updated after payment confirmation

### 3. Card Payment
- **Process**: Redirected to Razorpay
- **Methods**: Debit/Credit cards
- **Security**: PCI compliant
- **Status**: Updated after payment confirmation

## Configuration

### Environment Variables
```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
VITE_RAZORPAY_KEY_SECRET=your_test_key_secret
```

### Payment Method Configuration
```javascript
// Available in PaymentService
const methods = {
  cash: { available: true },
  online: { available: isRazorpayConfigured() },
  card: { available: isRazorpayConfigured() }
};
```

## Error Handling

### 1. Validation Errors
- **Empty Cart**: Prevent payment with empty cart
- **User Data**: Validate user authentication
- **Payment Method**: Check method availability
- **Configuration**: Verify Razorpay setup

### 2. Processing Errors
- **Network Issues**: Retry mechanism
- **Payment Failures**: User-friendly error messages
- **Database Errors**: Transaction rollback
- **Razorpay Errors**: Detailed error logging

### 3. Recovery Mechanisms
- **State Reset**: Clear processing state on errors
- **User Feedback**: Clear error messages
- **Fallback Options**: Alternative payment methods
- **Logging**: Comprehensive error logging

## Security Features

### 1. Payment Security
- **Razorpay Integration**: PCI compliant payment processing
- **Server-side Validation**: Payment signature verification
- **HTTPS**: Secure communication
- **Input Validation**: Sanitize all inputs

### 2. Order Security
- **OTP Generation**: Server-side only
- **Token Uniqueness**: Guaranteed unique tokens
- **Verification**: Server-side OTP verification
- **Audit Trail**: Complete transaction history

### 3. Data Protection
- **Encryption**: Sensitive data encryption
- **Access Control**: Role-based access
- **Session Management**: Secure session handling
- **Logging**: Audit logging for all operations

## Testing

### 1. Unit Tests
```javascript
// Test payment service
describe('PaymentService', () => {
  test('should initialize payment correctly', async () => {
    const result = await paymentService.initializePayment(params);
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests
```javascript
// Test payment flow
describe('Payment Flow', () => {
  test('should process online payment successfully', async () => {
    // Test complete payment flow
  });
});
```

### 3. Test Cards (Razorpay Test Mode)
```
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
UPI: success@razorpay
```

## Usage Examples

### 1. Basic Payment Integration
```javascript
import PaymentModal from '../components/PaymentModal';

function CartPage() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <PaymentModal
      isOpen={showPayment}
      onClose={() => setShowPayment(false)}
      cartItems={cartItems}
      total={total}
      userData={userData}
      options={options}
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}
```

### 2. Custom Payment Processing
```javascript
import paymentService from '../services/PaymentService';

async function customPayment() {
  try {
    const { transaction, orderData } = await paymentService.initializePayment({
      cartItems,
      total,
      userData,
      options
    });

    await paymentService.processOnlinePayment({
      transaction,
      orderData,
      onSuccess: (result) => console.log('Success:', result),
      onError: (error) => console.error('Error:', error)
    });
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
```

### 3. Payment Method Validation
```javascript
// Check if payment method is available
const isOnlineAvailable = paymentService.validatePaymentMethod('online');
const availableMethods = paymentService.getAvailablePaymentMethods();
```

## Performance Optimization

### 1. Lazy Loading
- **Razorpay Script**: Load only when needed
- **Payment Modal**: Render on demand
- **Service Initialization**: Initialize on first use

### 2. State Management
- **Processing State**: Prevent concurrent payments
- **Error Recovery**: Automatic state reset
- **Memory Management**: Clean up resources

### 3. Caching
- **Payment Methods**: Cache available methods
- **User Data**: Cache user information
- **Configuration**: Cache Razorpay config

## Monitoring and Analytics

### 1. Payment Analytics
- **Success Rate**: Track payment success rates
- **Method Usage**: Monitor payment method preferences
- **Error Tracking**: Log and analyze errors
- **Performance Metrics**: Monitor response times

### 2. Business Intelligence
- **Revenue Tracking**: Monitor transaction volumes
- **User Behavior**: Analyze payment patterns
- **Conversion Rates**: Track cart to payment conversion
- **Customer Insights**: Understand payment preferences

## Future Enhancements

### 1. Advanced Features
- **Split Payments**: Multiple payment methods per order
- **Recurring Payments**: Subscription support
- **Refund Processing**: Automated refund handling
- **Gift Cards**: Gift card integration

### 2. User Experience
- **Saved Cards**: Remember payment methods
- **Quick Pay**: One-click payments
- **Payment Reminders**: Order reminders
- **Loyalty Integration**: Points and rewards

### 3. Security Enhancements
- **3D Secure**: Enhanced card security
- **Biometric Auth**: Fingerprint/face recognition
- **Fraud Detection**: AI-powered fraud prevention
- **Compliance**: Enhanced regulatory compliance

## Troubleshooting

### Common Issues

1. **Razorpay Not Loading**
   - Check internet connection
   - Verify API key configuration
   - Check browser console for errors

2. **Payment Failing**
   - Verify test card details
   - Check payment method availability
   - Validate order amount

3. **OTP Not Generated**
   - Check database trigger
   - Verify payment status
   - Check transaction table structure

4. **Modal Not Opening**
   - Check component props
   - Verify state management
   - Check for JavaScript errors

### Debug Commands
```javascript
// Check payment service state
console.log('Processing:', paymentService.isProcessing);

// Validate payment method
console.log('Online available:', paymentService.validatePaymentMethod('online'));

// Check Razorpay configuration
console.log('Razorpay configured:', isRazorpayConfigured());
```

## Conclusion

The Smart Canteen Payment System provides a robust, secure, and user-friendly payment experience. With its modular architecture, comprehensive error handling, and advanced security features, it ensures smooth payment processing while maintaining data integrity and user privacy.

The system is designed to scale with business growth and can easily accommodate new payment methods and features as needed.
