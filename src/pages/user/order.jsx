import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  CreditCard, 
  Landmark, 
  Copy, 
  Check, 
  ArrowLeft, 
  Receipt, 
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Star,
  Sparkles
} from 'lucide-react';
import { checkAuthStatus } from '../../lib/auth-utils';
import { getTransactionByOrderNumber, getUserTransactions } from '../../lib/payment-utils';
import { getCartItems } from '../../lib/cart-utils';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({ otp: false, token: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const user = checkAuthStatus();
        if (!user) {
          navigate('/auth/login');
          return;
        }
        setUserData(user);

        // Get order number and transaction ID from URL
        const params = new URLSearchParams(location.search);
        const orderNumber = params.get('orderNumber');
        const transactionId = params.get('transactionId');

        if (orderNumber) {
          const transactionData = await getTransactionByOrderNumber(orderNumber);
          setTransaction(transactionData);
          
          // Get the cart items that were ordered (from localStorage using transaction ID)
          if (transactionData) {
            const cartItems = JSON.parse(localStorage.getItem(`orderItems_${transactionData.id}`) || '[]');
            setOrderItems(cartItems);
          }
        } else if (transactionId) {
          // If no order number, get latest transaction
          const transactions = await getUserTransactions(user.id);
          if (transactions.length > 0) {
            const latestTransaction = transactions[0];
            setTransaction(latestTransaction);
            
            // Get the cart items that were ordered
            const cartItems = JSON.parse(localStorage.getItem(`orderItems_${latestTransaction.id}`) || '[]');
            setOrderItems(cartItems);
          }
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

            // Set up real-time updates for OTP and token
        if (transaction && transaction.payment_status === 'pending') {
          console.log('Setting up real-time updates for transaction:', transaction.id);
          const interval = setInterval(async () => {
            try {
              const updatedTransaction = await getTransactionByOrderNumber(transaction.order_number);
              console.log('Checking for updates:', updatedTransaction);
              if (updatedTransaction && (updatedTransaction.otp || updatedTransaction.token_number)) {
                console.log('Found OTP/Token, updating transaction:', updatedTransaction);
                setTransaction(updatedTransaction);
                clearInterval(interval);
              }
            } catch (error) {
              console.error('Error checking for OTP/token updates:', error);
            }
          }, 2000); // Check every 2 seconds

          return () => clearInterval(interval);
        }
  }, [location, navigate, transaction]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header />
        <main className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-96 bg-gray-200 rounded-2xl"></div>
                  <div className="h-64 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 rounded-2xl"></div>
                  <div className="h-32 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header />
        <main className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
              <button
                onClick={() => navigate('/user/cart')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/user/cart')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Confirmation</h1>
              <p className="text-sm text-gray-600">Your order has been successfully placed!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Success Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Successful!</h2>
                    <p className="text-xs text-green-100">Your order is being prepared</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-green-100">Order Number</p>
                    <p className="font-bold text-base">{transaction.order_number}</p>
                  </div>
                  <div>
                    <p className="text-green-100">Total Amount</p>
                    <p className="font-bold text-base">₹{transaction.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

        {/* Order Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-semibold text-gray-800 capitalize">{transaction.payment_method}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-800">{transaction.user_email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Pickup</p>
                        <p className="font-semibold text-gray-800">15-20 minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pickup Location</p>
                        <p className="font-semibold text-gray-800">MITE Canteen Counter</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Phone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-semibold text-gray-800">+91 98765 43210</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Ordered Items</h3>
                </div>
                
                                 <div className="space-y-4">
                   {orderItems.length > 0 ? (
                     orderItems.map((item, index) => (
                       <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                         <img 
                           src={item.image_url || item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=80&h=80&fit=crop&crop=center"} 
                           alt={item.item_name || item.name} 
                           className="w-16 h-16 rounded-lg object-cover"
                         />
                         <div className="flex-grow">
                           <h4 className="font-semibold text-gray-800">{item.item_name || item.name}</h4>
                           <p className="text-sm text-gray-600">{item.category || 'Food Item'}</p>
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                           <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <p>Order items not available</p>
                     </div>
                   )}
                 </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* OTP & Token Card */}
              {transaction.payment_status === 'success' && (
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">Collection Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* OTP */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">OTP Code</p>
                        <button
                          onClick={() => copyToClipboard(transaction.otp || '123456', 'otp')}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copied.otp ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-600" />}
                        </button>
                      </div>
                      <p className="text-lg font-bold text-gray-900 tracking-wider">
                        {transaction.otp || '---'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Show this to collect your order</p>
                    </div>
                    
                    {/* Token */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">Token Number</p>
                        <button
                          onClick={() => copyToClipboard(transaction.token_number || 'T001', 'token')}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copied.token ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-600" />}
                        </button>
                      </div>
                                              <p className="text-lg font-bold text-gray-900 tracking-wider">
                          {transaction.token_number || '---'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Your unique order identifier</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-gray-800 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{transaction.subtotal_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">₹{transaction.service_fee?.toFixed(2) || '25.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{transaction.discount_amount?.toFixed(2) || '50.00'}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{transaction.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/user/cart')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  Place Another Order
                </button>
                <button
                  onClick={() => navigate('/user/profile')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <User size={20} />
                  View Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <main className="flex-1 pt-24 pb-8">
        <OrderPage />
      </main>
      <Footer />
    </div>
  );
}
