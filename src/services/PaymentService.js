import { 
  initializeRazorpayPayment, 
  createTransaction, 
  updateTransactionStatus,
  clearCartAfterPayment,
  formatOrderData,
  isRazorpayConfigured 
} from '../lib/payment-utils';

class PaymentService {
  constructor() {
    this.isProcessing = false;
  }

  /**
   * Initialize payment process
   * @param {Object} params - Payment parameters
   * @param {Array} params.cartItems - Cart items
   * @param {number} params.total - Total amount
   * @param {Object} params.userData - User data
   * @param {Object} params.options - Additional options
   * @returns {Promise<Object>} - Payment result
   */
  async initializePayment(params) {
    const { cartItems, total, userData, options } = params;

    // Validate inputs
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty. Please add items before proceeding to payment.');
    }

    if (!userData) {
      throw new Error('User data not available. Please refresh the page.');
    }

    if (this.isProcessing) {
      throw new Error('Payment is already being processed. Please wait.');
    }

    this.isProcessing = true;

    try {
      // Format order data
      const orderData = formatOrderData(cartItems, total, userData, options);
      
      // Create initial transaction
      const transaction = await createTransaction({
        userId: userData.id,
        userEmail: userData.email || `${userData.email_name}@mite.ac.in`,
        amount: total,
        paymentMethod: 'pending' // Will be updated based on selected method
      });

      return {
        success: true,
        transaction,
        orderData
      };
    } catch (error) {
      this.isProcessing = false;
      throw error;
    }
  }

  /**
   * Process online payment with Razorpay
   * @param {Object} params - Payment parameters
   * @param {Object} params.transaction - Transaction object
   * @param {Object} params.orderData - Order data
   * @param {Function} params.onSuccess - Success callback
   * @param {Function} params.onError - Error callback
   */
  async processOnlinePayment(params) {
    const { transaction, orderData, onSuccess, onError } = params;

    try {
      // Check if Razorpay is configured
      if (!isRazorpayConfigured()) {
        throw new Error('Razorpay is not configured. Please contact support.');
      }

      // Update transaction with online payment method
      await updateTransactionStatus(transaction.id, 'pending');

      // Initialize Razorpay payment
      await initializeRazorpayPayment(
        orderData,
        async (paymentResponse) => {
          // Payment successful
          try {
            // Update transaction status to success
            const updatedTransaction = await updateTransactionStatus(
              paymentResponse.transactionId, 
              'success'
            );

            // Clear cart
            await clearCartAfterPayment(orderData.userId);

            this.isProcessing = false;

            // Call success callback
            if (onSuccess) {
              onSuccess(updatedTransaction);
            }
          } catch (error) {
            console.error('Error processing successful payment:', error);
            this.isProcessing = false;
            
            if (onError) {
              onError('Payment successful but order processing failed. Please contact support.');
            }
          }
        },
        (error) => {
          // Payment failed
          console.error('Payment failed:', error);
          this.isProcessing = false;
          
          if (onError) {
            onError(`Payment failed: ${error}`);
          }
        }
      );
    } catch (error) {
      this.isProcessing = false;
      throw error;
    }
  }

  /**
   * Process cash payment
   * @param {Object} params - Payment parameters
   * @param {Object} params.transaction - Transaction object
   * @param {Object} params.userData - User data
   * @param {number} params.total - Total amount
   * @param {Function} params.onSuccess - Success callback
   * @param {Function} params.onError - Error callback
   */
  async processCashPayment(params) {
    const { transaction, userData, total, onSuccess, onError } = params;

    try {
      // Update transaction with cash payment method
      await updateTransactionStatus(transaction.id, 'cash');

      // Update transaction status to success (for cash payments)
      const updatedTransaction = await updateTransactionStatus(transaction.id, 'success');

      // Clear cart
      await clearCartAfterPayment(userData.id);

      this.isProcessing = false;

      // Call success callback
      if (onSuccess) {
        onSuccess(updatedTransaction);
      }
    } catch (error) {
      console.error('Error processing cash order:', error);
      this.isProcessing = false;
      
      if (onError) {
        onError('Failed to place order. Please try again.');
      }
    }
  }



  /**
   * Get payment method details
   * @param {string} method - Payment method
   * @returns {Object} - Payment method details
   */
  getPaymentMethodDetails(method) {
    const methods = {
      cash: {
        id: 'cash',
        label: 'Cash Payment',
        icon: 'CreditCard',
        description: 'Pay at the counter when collecting your order',
        color: 'green',
        available: true
      },
      online: {
        id: 'online',
        label: 'Online Payment',
        icon: 'Landmark',
        description: 'Pay securely using UPI, Cards, or Net Banking',
        color: 'blue',
        available: isRazorpayConfigured()
      }
    };

    return methods[method] || methods.cash;
  }

  /**
   * Get all available payment methods
   * @returns {Array} - Available payment methods
   */
  getAvailablePaymentMethods() {
    return ['cash', 'online'].map(method => this.getPaymentMethodDetails(method));
  }

  /**
   * Validate payment method
   * @param {string} method - Payment method
   * @returns {boolean} - Is method valid and available
   */
  validatePaymentMethod(method) {
    const methodDetails = this.getPaymentMethodDetails(method);
    return methodDetails && methodDetails.available;
  }

  /**
   * Calculate order summary
   * @param {Array} cartItems - Cart items
   * @returns {Object} - Order summary
   */
  calculateOrderSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceFee = 25.00;
    const discount = 50.00;
    const total = subtotal + serviceFee - discount;

    return {
      subtotal,
      serviceFee,
      discount,
      total
    };
  }

  /**
   * Reset payment processing state
   */
  reset() {
    this.isProcessing = false;
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;
