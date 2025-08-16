import supabase from './supabase';

// Razorpay configuration - Test Mode
const RAZORPAY_KEY_ID = 'rzp_test_1DP5mmOlF5G5ag';
const RAZORPAY_KEY_SECRET = 'thisissecret';

// Note: These are test keys. For production, use your actual Razorpay keys

// Check if Razorpay is configured
export const isRazorpayConfigured = () => {
  return !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
};

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Create transaction in database with comprehensive structure
export const createTransaction = async (transactionData) => {
  try {
    const orderNumber = generateOrderNumber();
    
    // Validate required fields
    if (!transactionData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!transactionData.userEmail) {
      throw new Error('User email is required');
    }
    
    // Include all required fields from the comprehensive transactions table
    const transactionRecord = {
      user_id: transactionData.userId,
      user_email: transactionData.userEmail,
      user_name: transactionData.userName || transactionData.userEmail?.split('@')[0] || 'Guest',
      user_phone: transactionData.userPhone || '',
      total_amount: parseFloat(transactionData.totalAmount) || 0,
      subtotal_amount: parseFloat(transactionData.subtotalAmount) || parseFloat(transactionData.totalAmount) || 0,
      service_fee: parseFloat(transactionData.serviceFee) || 25.00,
      discount_amount: parseFloat(transactionData.discountAmount) || 50.00,
      payment_method: transactionData.paymentMethod,
      payment_status: 'pending',
      payment_gateway: transactionData.paymentGateway || 'razorpay',
      order_number: orderNumber,
      order_status: 'Pending',
      dining_option: transactionData.diningOption || 'takeaway',
      special_instructions: transactionData.specialInstructions || '',
      estimated_pickup_time: transactionData.estimatedPickupTime || null
    };

    console.log('Creating transaction with data:', transactionRecord);
    console.log('User ID being sent:', transactionData.userId);
    console.log('User ID type:', typeof transactionData.userId);
    console.log('Order status being sent:', transactionRecord.order_status);
    console.log('Order status type:', typeof transactionRecord.order_status);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionRecord)
      .select()
      .single();

    if (error) throw error;
    
    // Store order items in localStorage for now (since order_items table might not exist)
    if (transactionData.orderItems && transactionData.orderItems.length > 0) {
      localStorage.setItem(`orderItems_${data.id}`, JSON.stringify(transactionData.orderItems));
    }

    return { ...data, orderNumber };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Update transaction status
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ payment_status: status })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

// Update transaction OTP
export const updateTransactionOTP = async (transactionId, otp) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ otp: otp })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction OTP:', error);
    throw error;
  }
};

// Generate next sequential token number in perfect format #tok-001
export const generateNextTokenNumber = async () => {
  try {
    // Get the highest token number and increment
    const { data, error } = await supabase
      .from('transactions')
      .select('token_number')
      .not('token_number', 'is', null)
      .order('token_number', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastToken = data[0].token_number;
      // Extract number from token (could be M001, #tok-001, or just 001)
      let lastNumber = 1;
      if (lastToken.startsWith('M')) {
        lastNumber = parseInt(lastToken.substring(1));
      } else if (lastToken.startsWith('#tok-')) {
        lastNumber = parseInt(lastToken.substring(5));
      } else {
        // Assume it's just a number
        lastNumber = parseInt(lastToken) || 1;
      }
      nextNumber = lastNumber + 1;
    }

    return nextNumber.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating token number:', error);
    // Fallback to timestamp-based token
    return Date.now().toString().slice(-3).padStart(3, '0');
  }
};

// Update both OTP and token
export const updateTransactionOTPAndToken = async (transactionId, otp, tokenNumber) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        otp: otp,
        token_number: tokenNumber
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction OTP and token:', error);
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (transactionId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

// Get transaction by order number
export const getTransactionByOrderNumber = async (orderNumber) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting transaction by order number:', error);
    throw error;
  }
};

// Create order for test mode
export const createOrder = async (orderData) => {
  try {
    // For test mode, we'll create a mock order that works with Razorpay test
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate a successful order creation with delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockOrder = {
      id: orderId,
      amount: orderData.amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      status: 'created',
      created_at: new Date().toISOString()
    };

    console.log('Created mock Razorpay order:', mockOrder);
    return mockOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Initialize payment with offline-first approach
export const initializeRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Prevent multiple instances
    if (window.currentRazorpayInstance) {
      console.log('Payment instance already exists, closing previous one');
      window.currentRazorpayInstance.close();
    }

            // Create transaction in database first
        const transaction = await createTransaction({
          userId: orderData.userId,
          userEmail: orderData.userEmail,
          userName: orderData.userName,
          userPhone: orderData.userPhone,
          totalAmount: orderData.totalAmount,
          subtotalAmount: orderData.subtotalAmount,
          serviceFee: orderData.serviceFee,
          discountAmount: orderData.discountAmount,
          paymentMethod: 'online',
          paymentGateway: orderData.paymentGateway,
          diningOption: orderData.diningOption,
          specialInstructions: orderData.specialInstructions,
          estimatedPickupTime: orderData.estimatedPickupTime,
          orderItems: orderData.orderItems
        });

    // Create a beautiful payment modal instead of using Razorpay
    console.log('Creating custom payment modal for order:', transaction.orderNumber);
    const paymentModal = createPaymentModal({
      orderNumber: transaction.orderNumber,
      amount: orderData.totalAmount,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      onSuccess: async () => {
        // Simulate successful payment
        const mockPaymentResponse = {
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_order_id: `order_${Date.now()}`,
          razorpay_signature: `sig_${Date.now()}`,
          transactionId: transaction.id,
          orderNumber: transaction.orderNumber
        };
        
        // Generate a random 6-digit OTP for testing
        const randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated random OTP:', randomOTP);
        
        // Generate a sequential token number (M001, M002, etc.)
        const tokenNumber = await generateNextTokenNumber();
        console.log('Generated token number:', tokenNumber);
        
        // Update transaction status to success (this will trigger the database trigger)
        console.log('Updating transaction status to success...');
        await updateTransactionStatus(transaction.id, 'success');
        
        // Also update OTP and token directly for immediate display
        console.log('Updating OTP and token in database...');
        await updateTransactionOTPAndToken(transaction.id, randomOTP, tokenNumber);
        console.log('Successfully updated OTP and token!');
        
        // Close modal
        if (paymentModal) {
          document.body.removeChild(paymentModal);
        }
        
        onSuccess(mockPaymentResponse);
      },
      onCancel: () => {
        // Close modal
        if (paymentModal) {
          document.body.removeChild(paymentModal);
        }
        onFailure('Payment cancelled by user');
      }
    });

    // Store modal reference
    window.currentRazorpayInstance = paymentModal;
    
  } catch (error) {
    console.error('Error initializing payment:', error);
    onFailure(error.message);
  }
};

// Create a beautiful payment modal
function createPaymentModal({ orderNumber, amount, customerName, customerEmail, onSuccess, onCancel }) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideIn 0.3s ease-out;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  content.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 style="margin: 0 0 8px; color: #1F2937; font-size: 24px; font-weight: 600;">Payment Gateway</h2>
      <p style="margin: 0; color: #6B7280; font-size: 14px;">Smart Canteen Payment System</p>
    </div>

    <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6B7280; font-size: 14px;">Order Number:</span>
        <span style="color: #1F2937; font-weight: 600; font-size: 14px;">${orderNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6B7280; font-size: 14px;">Customer:</span>
        <span style="color: #1F2937; font-weight: 600; font-size: 14px;">${customerName || 'Guest'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6B7280; font-size: 14px;">Email:</span>
        <span style="color: #1F2937; font-weight: 600; font-size: 14px;">${customerEmail || 'N/A'}</span>
      </div>
      <div style="border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #1F2937; font-weight: 600; font-size: 16px;">Total Amount:</span>
          <span style="color: #059669; font-weight: 700; font-size: 18px;">₹${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" style="margin-right: 8px;">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span style="color: #92400E; font-weight: 600; font-size: 14px;">Test Mode</span>
      </div>
      <p style="margin: 0; color: #92400E; font-size: 12px; line-height: 1.4;">
        This is a test payment simulation. No real money will be charged. Click "Pay Now" to simulate a successful payment.
      </p>
    </div>

    <div style="display: flex; gap: 12px;">
      <button id="cancelBtn" style="
        flex: 1;
        padding: 12px 24px;
        border: 1px solid #D1D5DB;
        background: white;
        color: #6B7280;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='white'">
        Cancel
      </button>
      <button id="payBtn" style="
        flex: 1;
        padding: 12px 24px;
        border: none;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        color: white;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.background='linear-gradient(135deg, #2563EB, #1E40AF)'" onmouseout="this.style.background='linear-gradient(135deg, #3B82F6, #1D4ED8)'">
        Pay Now
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('#payBtn').addEventListener('click', onSuccess);
  modal.querySelector('#cancelBtn').addEventListener('click', onCancel);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      onCancel();
    }
  });

  return modal;
}

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Razorpay script load timeout'));
    }, 10000); // 10 seconds timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      if (window.Razorpay) {
        resolve();
      } else {
        reject(new Error('Razorpay not available after script load'));
      }
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.head.appendChild(script);
  });
};

// Save order to database (now using transactions table)
export const saveOrderToDatabase = async (orderData, paymentResponse) => {
  try {
    // Update transaction status to success
    const updatedTransaction = await updateTransactionStatus(
      paymentResponse.transactionId, 
      'success'
    );

    // The OTP and token will be automatically generated by the database trigger
    // when payment_status changes to 'success'
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error saving order to database:', error);
    throw error;
  }
};

// Clear cart after successful payment
export const clearCartAfterPayment = async (userId) => {
  try {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Validate payment
export const validatePayment = async (paymentResponse) => {
  try {
    // In production, you should verify the payment signature on your backend
    // For now, we'll just check if the payment response has required fields
    const requiredFields = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'];
    
    for (const field of requiredFields) {
      if (!paymentResponse[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Payment validation failed:', error);
    throw error;
  }
};

// Format order data for Razorpay
export const formatOrderData = (cartItems, total, userData, options) => {
  return {
    amount: Math.round(total * 100), // Razorpay expects amount in paise
    currency: 'INR',
    items: cartItems.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    userId: userData.id,
    customerName: userData.name || userData.email_name || '',
    customerEmail: userData.email || `${userData.email_name}@mite.ac.in`,
    customerPhone: userData.phone || '',
    deliveryOption: options.diningOption,
    pickupTime: options.pickupTime,
    specialInstructions: options.instructions,
  };
};

// Get user's transaction history
export const getUserTransactions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

// Verify OTP for order collection
export const verifyOTP = async (orderNumber, otp) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('otp', otp)
      .eq('payment_status', 'success')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Get transaction by token number
export const getTransactionByToken = async (tokenNumber) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('token_number', tokenNumber)
      .eq('payment_status', 'success')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting transaction by token:', error);
    throw error;
  }
};

// Test function to check table structure
export const testTableStructure = async () => {
  try {
    console.log('Testing table structure...');
    
    // Try to insert a minimal transaction to see what fields are required
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        user_email: 'test@test.com',
        total_amount: 100.00,
        payment_method: 'test'
      })
      .select();
    
    if (error) {
      console.error('Table structure test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Table structure test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Table structure test error:', error);
    return { success: false, error: error.message };
  }
};
