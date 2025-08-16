import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, ChevronDown, Clock, CreditCard, Home, Landmark, Minus, Plus, ShoppingCart, User, Wallet, MessageSquare, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { updateCartItemQuantity, removeFromCart, clearCart } from '../../lib/cart-utils';
import { checkAuthStatus } from '../../lib/auth-utils';
import { useCart } from '../../lib/cart-context';
import { clearCartAfterPayment } from '../../lib/payment-utils';
import PaymentModal from '../../components/PaymentModal';
import { Receipt } from 'lucide-react';

// --- Helper Function to Generate Time Slots ---
const generateTimeSlots = () => {
  const slots = [];
  const now = new Date();
  let currentHour = now.getHours();
  let currentMinute = now.getMinutes();

  // Canteen opens at 7:00 AM
  const startHour = 7;
  const startMinute = 0;
  // Canteen closes at 7:30 PM (19:30)
  const endHour = 19;
  const endMinute = 30;

  // If current time is before opening, start from opening
  if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
    currentHour = startHour;
    currentMinute = startMinute;
  }

  // Round up to the next 15-minute interval
  if (currentMinute > 0 && currentMinute <= 15) currentMinute = 15;
  else if (currentMinute > 15 && currentMinute <= 30) currentMinute = 30;
  else if (currentMinute > 30 && currentMinute <= 45) currentMinute = 45;
  else if (currentMinute > 45) {
    currentMinute = 0;
    currentHour += 1;
  }

  // If current time is after closing, return empty array
  if (currentHour > endHour || (currentHour === endHour && currentMinute > endMinute)) {
    return [];
  }

  // Generate slots from current time up to 7:30 PM
  while (
    currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
    const displayMinute = currentMinute.toString().padStart(2, '0');
    slots.push(`${displayHour}:${displayMinute} ${period}`);

    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  return slots;
};


// --- Cart State Management ---
const useCartData = () => {
  const { cartItems, loading, error, refreshCart, clearCartState } = useCart();

  return { cartItems, loading, error, refreshCart, clearCartState };
};

// --- Reusable Components ---

const OrderItem = ({ item, onQuantityChange, updating }) => (
  <div className="flex items-center gap-4 py-4 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
    <div className="flex-grow">
      <p className="font-semibold text-base text-gray-900 mb-1">{item.name}</p>
      <p className="text-sm text-gray-600 font-medium">₹{item.price.toFixed(2)}</p>
      {item.stockAvailable !== undefined && (
        <p className="text-xs text-gray-500 mt-1">
          Stock: {item.stockAvailable} available
        </p>
      )}
    </div>
    <div className="flex items-center gap-3 border border-gray-200 rounded-full py-2 px-3 bg-white shadow-sm">
      <button 
        onClick={() => onQuantityChange(item.id, -1)} 
        disabled={updating}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Minus size={14} className="text-gray-600" />
      </button>
      <span className="font-bold text-base w-6 text-center text-gray-900">
        {updating ? '...' : item.quantity}
      </span>
      <button 
        onClick={() => onQuantityChange(item.id, 1)} 
        disabled={updating}
        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Plus size={14} className="text-gray-600" />
      </button>
    </div>
  </div>
);

const DiningOption = ({ icon, title, description, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
      selected 
        ? 'border-orange-500 bg-orange-50 shadow-md' 
        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
    }`}
  >
    <div className={`p-3 rounded-xl ${selected ? 'bg-orange-100' : 'bg-gray-100'}`}>
    {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    {selected && (
      <div className="p-2 bg-orange-500 rounded-full">
        <CheckCircle size={20} className="text-white" />
      </div>
    )}
  </div>
);

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-5">{title}</h2>
        {children}
    </div>
);


// --- Main Cart Component ---
const SmartCanteenCart = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, error: cartError, refreshCart, clearCartState } = useCartData();
  const [diningOption, setDiningOption] = useState('dine-in');
  const [pickupTime, setPickupTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
    if (slots.length > 0) {
      setPickupTime(slots[0]);
    }
  }, []);

  // Fetch user data from localStorage session
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
          const sessionData = JSON.parse(userSession);
          if (sessionData && sessionData.id) {
            setUserData(sessionData);
          }
        }
      } catch (error) {
        console.error('Error parsing user session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleQuantityChange = async (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + change);
    
    if (newQuantity === 0) {
      // Remove item from cart
      setUpdatingQuantity(itemId);
      try {
        const result = await removeFromCart(itemId);
        if (result.success) {
          refreshCart(); // Refresh cart data
        } else {
          console.error('Failed to remove item:', result.error);
        }
      } catch (error) {
        console.error('Error removing item:', error);
      } finally {
        setUpdatingQuantity(null);
      }
    } else {
      // Update quantity
      setUpdatingQuantity(itemId);
      try {
        const result = await updateCartItemQuantity(itemId, newQuantity);
        if (result.success) {
          refreshCart(); // Refresh cart data
        } else {
          console.error('Failed to update quantity:', result.error);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        setUpdatingQuantity(null);
      }
    }
  };

  // Cleanup function to close any existing modals
  const cleanupModals = () => {
    setShowPaymentModal(false);
    if (window.currentRazorpayInstance) {
      try {
        // Check if it's a DOM element (our custom modal) or Razorpay instance
        if (window.currentRazorpayInstance instanceof Element) {
          // Check if the element is actually a child of document.body before removing
          if (document.body.contains(window.currentRazorpayInstance)) {
            document.body.removeChild(window.currentRazorpayInstance);
          }
        } else if (typeof window.currentRazorpayInstance.close === 'function') {
          window.currentRazorpayInstance.close();
        }
      } catch (error) {
        console.log('Modal cleanup error (non-critical):', error);
      } finally {
        window.currentRazorpayInstance = null;
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  const handlePaymentClick = async () => {
    if (selectedPaymentMethod === 'online') {
      // Direct Razorpay payment for online
      try {
        // Clean up any existing modals first
        cleanupModals();
        
        const { initializeRazorpayPayment } = await import('../../lib/payment-utils');
        
        const orderData = {
          userId: userData.id,
          userEmail: userData.email || `${userData.email_name}@mite.ac.in`,
          userName: userData.name || userData.email_name || '',
          userPhone: userData.phone || '',
          totalAmount: total,
          subtotalAmount: subtotal,
          serviceFee: serviceFee,
          discountAmount: discount,
          paymentMethod: 'online',
          paymentGateway: 'razorpay',
          diningOption: diningOption,
          specialInstructions: instructions,
          estimatedPickupTime: pickupTime ? new Date(pickupTime) : null,
          orderItems: cartItems
        };

        console.log('Order data being sent:', orderData);
        console.log('User data:', userData);
        console.log('User ID:', userData.id);
        console.log('User ID type:', typeof userData.id);
        console.log('Total amount:', total);
        console.log('Subtotal:', subtotal);

        // Save cart items to localStorage before payment
        localStorage.setItem('lastOrderItems', JSON.stringify(cartItems));
        
        // Close any existing payment modals first
        setShowPaymentModal(false);
        
        try {
          await initializeRazorpayPayment(
            orderData,
            async (paymentResponse) => {
              // Payment successful
              console.log('Payment successful:', paymentResponse);
              // Clear cart immediately after successful payment
              console.log('Clearing cart after online payment...');
              await clearCartAfterPayment(userData.id);
              console.log('Cart cleared from database');
              // Clear cart state in UI immediately
              clearCartState();
              console.log('Cart state cleared from UI');
              // Redirect to orders page to see all orders
              navigate('/user/orders');
            },
            (error) => {
              // Payment failed
              console.error('Payment failed:', error);
              alert(`Payment failed: ${error}`);
            }
          );
        } catch (razorpayError) {
          console.error('Razorpay initialization failed:', razorpayError);
          
          // Fallback: Create transaction and redirect to order page
          try {
            const { createTransaction } = await import('../../lib/payment-utils');
            const transaction = await createTransaction({
              userId: userData.id,
              userEmail: userData.email || `${userData.email_name}@mite.ac.in`,
              userName: userData.name || userData.email_name || '',
              userPhone: userData.phone || '',
              totalAmount: total,
              subtotalAmount: subtotal,
              serviceFee: serviceFee,
              discountAmount: discount,
              paymentMethod: 'online',
              paymentGateway: 'razorpay',
              diningOption: diningOption,
              specialInstructions: instructions,
              estimatedPickupTime: pickupTime ? new Date(pickupTime) : null,
              orderItems: cartItems
            });
            
            // Update transaction status to success for demo
            const { updateTransactionStatus } = await import('../../lib/payment-utils');
            await updateTransactionStatus(transaction.id, 'success');
            
            // Clear cart immediately after successful order placement
            console.log('Clearing cart after fallback payment...');
            await clearCartAfterPayment(userData.id);
            console.log('Cart cleared from database');
            // Clear cart state in UI immediately
            clearCartState();
            console.log('Cart state cleared from UI');
            
            alert('Payment gateway unavailable. Order placed successfully!');
            navigate('/user/orders');
          } catch (fallbackError) {
            console.error('Fallback payment failed:', fallbackError);
            alert('Payment system unavailable. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error initializing payment:', error);
        alert('Failed to initialize payment. Please try again.');
      }
    } else {
      // Cash payment - use modal
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (transaction) => {
    try {
      console.log('Payment success - clearing cart...');
      // Clear cart from database
      await clearCartAfterPayment(userData.id);
      console.log('Cart cleared from database');
      // Clear cart state in UI immediately
      clearCartState();
      console.log('Cart state cleared from UI');
      // Refresh cart context
      refreshCart();
      console.log('Cart context refreshed');
    } catch (error) {
      console.error('Error clearing cart after payment:', error);
      // Still clear UI state even if database clear fails
      clearCartState();
      console.log('Cart state cleared from UI (fallback)');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = 25.00;
  const grabGoFee = diningOption === 'grab-and-go' ? 10.00 : 0;
  const discount = 50.00;
  const total = subtotal + serviceFee + grabGoFee - discount;

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-50 rounded-full">
              <ShoppingCart className="text-orange-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Canteen Cart</h1>
              <p className="text-gray-500 text-sm mt-1">Review your items and complete your order</p>
            </div>
        </div>
        
        {cartError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 font-medium">{cartError}</p>
            </div>
          </div>
        )}



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {cartLoading ? (
              <SectionCard title="Cart Items">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-14 h-14 bg-gray-200 rounded-md"></div>
                        <div className="flex-grow">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-5 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : cartItems.length === 0 ? (
              <SectionCard title="Cart Items">
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>
                </div>
              </SectionCard>
            ) : (
              <SectionCard title="Cart Items">
                {cartItems.map(item => (
                  <OrderItem 
                    key={item.id} 
                    item={item} 
                    onQuantityChange={handleQuantityChange}
                    updating={updatingQuantity === item.id}
                  />
                ))}
              </SectionCard>
            )}
            
            <SectionCard title="Your Details">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback>
                                {userData ? (userData.name ? userData.name.charAt(0).toUpperCase() : userData.email_name ? userData.email_name.charAt(0).toUpperCase() : 'U') : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                                </div>
                            ) : userData ? (
                                <>
                                    <p className="font-semibold text-sm text-gray-800">
                                        {userData.name || userData.email_name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {userData.email || `${userData.email_name}@mite.ac.in`}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-sm text-gray-800">Guest User</p>
                                    <p className="text-xs text-gray-500">Please login to continue</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button className="font-semibold text-xs text-orange-600 hover:underline">Change</button>
                </div>
            </SectionCard>

            <SectionCard title="Dining & Pickup Options">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DiningOption
                  icon={<Home size={24} className="text-orange-500" />}
                  title="Dine In"
                  description="Enjoy your meal at our canteen."
                  selected={diningOption === 'dine-in'}
                  onClick={() => setDiningOption('dine-in')}
                />
                <DiningOption
                  icon={<ShoppingCart size={24} className="text-orange-500" />}
                  title="Grab & Go"
                  description="Quickly pick up your order."
                  selected={diningOption === 'grab-and-go'}
                  onClick={() => setDiningOption('grab-and-go')}
                />
              </div>
              <div className="relative">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Pickup Time</label>
                  {timeSlots.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-semibold bg-red-50 border border-red-200 rounded-md px-4 py-3 mt-2">
                      <Clock size={16} className="text-red-400" />
                      Canteen is closed for pickups.
                    </div>
                  ) : (
                    <>
                      <Clock className="absolute left-3 top-9 text-gray-400" size={16} />
                      <select 
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full text-sm pl-9 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                          {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-9 text-gray-400" size={16} />
                    </>
                  )}
              </div>
            </SectionCard>
            
            <SectionCard title="Special Instructions">
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g., Make it less spicy, no onions..."
                        className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        rows="3"
                    ></textarea>
                </div>
            </SectionCard>

            <SectionCard title="Payment Method">
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm mb-4">Select your preferred payment method</p>
                    
                    {/* Payment Method Options */}
                <div className="space-y-3">
                        {/* Cash on Delivery */}
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedPaymentMethod === 'cash'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
                        }`}>
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                                <CreditCard size={18} className="text-green-600" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cash"
                                        checked={selectedPaymentMethod === 'cash'}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <span className="font-semibold text-base text-gray-900">Cash on Delivery</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Pay at the counter when collecting your order</p>
                            </div>
                        </label>

                        {/* Online Payment */}
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedPaymentMethod === 'online'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}>
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                                <Landmark size={18} className="text-blue-600" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="online"
                                        checked={selectedPaymentMethod === 'online'}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="font-semibold text-base text-gray-900">Online Payment</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Pay securely using UPI, Cards, or Net Banking</p>
                            </div>
                        </label>
                    </div>
                </div>
            </SectionCard>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
                {cartLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                          <div className="flex-grow">
                            <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No items in cart</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">₹{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                                              <span className="font-bold text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Apply Coupon</label>
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="MITE20" 
                            className="w-full text-sm pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                        />
                    </div>
                    <button className="bg-orange-500 text-white font-semibold text-sm py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors shadow-sm">Apply</button>
                </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6 space-y-3 text-sm">
              <dl className="space-y-3">
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600">Service Fee</dt>
                    <dd className="font-medium text-gray-900">₹{serviceFee.toFixed(2)}</dd>
                  </div>
                  {diningOption === 'grab-and-go' && (
                    <div className="flex justify-between items-center text-orange-600">
                      <dt>Grab & Go Charge</dt>
                      <dd className="font-medium">+₹10.00</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-green-600">
                    <dt>Discount</dt>
                    <dd className="font-medium">-₹{discount.toFixed(2)}</dd>
                  </div>
              </dl>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handlePaymentClick}
              disabled={cartItems.length === 0}
              className={`w-full mt-6 font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3 text-base ${
                cartItems.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : selectedPaymentMethod === 'online'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            >
              {selectedPaymentMethod === 'online' ? (
                <>
                  <Landmark size={20} />
                  Pay Online ₹{total.toFixed(2)}
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Place Order ₹{total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal - Only show for cash payments */}
      {selectedPaymentMethod === 'cash' && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cartItems={cartItems}
          total={total}
          userData={userData}
          options={{
            diningOption,
            pickupTime,
            instructions
          }}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-24 pb-8">
        <SmartCanteenCart />
      </main>
      <Footer />
    </div>
  );
}
