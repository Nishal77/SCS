import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { 
  Clock, 
  User, 
  ShoppingBag, 
  ArrowLeft, 
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  DollarSign,
  ChefHat,
  Bell,
  Truck
} from 'lucide-react';
import { checkAuthStatus } from '../../lib/auth-utils';
import { getUserTransactions } from '../../lib/payment-utils';
import { safeParseDate, formatTime, calculateFutureTime } from '../../lib/utils';
import supabase from '../../lib/supabase';

/**
 * UserOrdersPage Component
 * 
 * Features:
 * - Shows only today's orders (refreshes daily at midnight)
 * - Daily refresh system that clears current orders ONLY after 12:00 AM (00:00)
 * - Prevents refresh during the same day before midnight
 * - View History preserves all historical records
 * - Real-time updates for current day orders only
 * - Manual refresh capability for current day
 * 
 * Time Logic:
 * - 11:59 PM → Same day, show current orders
 * - 12:00 AM (00:00) → New day, clear orders, show "new day" state
 * - 12:01 AM → Still new day, maintain "new day" state
 * - 1:00 AM+ → Reset "new day" state, allow normal operation
 */
const UserOrdersPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting'); // 'connecting', 'connected', 'polling'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const user = checkAuthStatus();
        console.log('User data from checkAuthStatus:', user);
        
        if (!user || !user.id) {
          console.log('No user data or user ID, redirecting to login');
          navigate('/auth/login');
          return;
        }
        
        setUserData(user);
        console.log('User data set:', user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Daily refresh logic - check if it's a new day (only after 12:00 AM)
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only proceed with refresh logic after 12:00 AM (00:00)
      // This ensures we don't refresh during the same day before midnight
      if (currentHour === 0 && currentMinute === 0) {
        const today = now.toDateString();
        const storedDate = localStorage.getItem('last_orders_date');
        
        if (storedDate !== today) {
          console.log('🔄 New day detected at midnight! Clearing current orders...');
          setIsNewDay(true);
          setOrders([]); // Clear current orders
          localStorage.setItem('last_orders_date', today);
          
          // Show notification about daily refresh
          showNotification('📅 Orders refreshed for the new day!', 'info');
        }
      } else {
        // If it's not midnight, ensure we're not in "new day" state
        // This handles cases where user visits the page after midnight but before the next check
        const today = now.toDateString();
        const storedDate = localStorage.getItem('last_orders_date');
        
        if (storedDate === today && isNewDay) {
          console.log('🔄 Resetting new day state - same day detected');
          setIsNewDay(false);
        }
      }
      
      setCurrentDate(now);
    };

    // Check immediately
    checkNewDay();
    
    // Set up interval to check every minute
    const interval = setInterval(checkNewDay, 60000);
    
    return () => clearInterval(interval);
  }, [isNewDay]);

  // Separate useEffect to fetch orders when userData is available
  useEffect(() => {
    if (userData && userData.id && !isNewDay) {
      console.log('User data available, fetching orders for:', userData.id);
      fetchUserOrders(userData.id);
    }
  }, [userData, isNewDay]);

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (userData && userData.id) {
      console.log('Setting up real-time subscription for user:', userData.id);
      const subscription = supabase
        .channel('user_orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userData.id}`
          },
          (payload) => {
            console.log('🔔 User real-time update received:', payload);
            console.log('Event type:', payload.eventType);
            console.log('User ID filter:', userData.id);
            console.log('Old data:', payload.old);
            console.log('New data:', payload.new);
            
            // Handle different types of changes intelligently
            if (payload.eventType === 'UPDATE') {
              // For updates, check if it's a status change
              if (payload.new && payload.old && 
                  payload.new.order_status !== payload.old.order_status) {
                console.log('✅ Order status changed from', payload.old.order_status, 'to', payload.new.order_status);
                console.log('🔄 Updating UI immediately...');
                
                // Update local state immediately for instant feedback
                setOrders(prevOrders => 
                  prevOrders.map(order => 
                    order.id === payload.new.id 
                      ? { ...order, orderStatus: payload.new.order_status }
                      : order
                  )
                );
                
                // Show status change notification
                const status = payload.new.order_status;
                if (status === 'Accepted') {
                  showNotification('🎉 Order accepted! Starting to prepare...', 'success');
                } else if (status === 'Cooking') {
                  showNotification('👨‍🍳 Order is now being cooked!', 'info');
                } else if (status === 'Ready') {
                  showNotification('🎯 Order is ready for pickup!', 'success');
                } else if (status === 'Delivered') {
                  showNotification('🚀 Order delivered successfully!', 'success');
                } else if (status === 'Rejected') {
                  showNotification('❌ Order was rejected', 'error');
                }
              } else {
                console.log('ℹ️ Update detected but no status change, skipping UI update');
              }
            } else if (payload.eventType === 'INSERT') {
              // For new orders, refresh to show them (only if it's today's order)
              console.log('🆕 New order detected, refreshing orders...');
              if (!isNewDay) {
                fetchUserOrders(userData.id);
              }
            } else if (payload.eventType === 'DELETE') {
              // For deletions, refresh to remove them (only if it's today's order)
              console.log('🗑️ Order deleted, refreshing orders...');
              if (!isNewDay) {
                fetchUserOrders(userData.id);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 User real-time subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
            console.log('✅ Real-time connected successfully');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setRealtimeStatus('polling');
            console.log('⚠️ Real-time subscription failed, falling back to polling...');
            startPolling();
          }
        });

      return () => {
        console.log('Cleaning up real-time subscription');
        subscription.unsubscribe();
      };
    }
  }, [userData]);

  // Polling fallback for when real-time fails
  const startPolling = () => {
    console.log('🔄 Starting polling fallback...');
    const interval = setInterval(() => {
      if (userData && userData.id) {
        console.log('🔄 Polling for updates...');
        fetchUserOrders(userData.id);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  };

  const fetchUserOrders = async (userId) => {
    try {
      console.log('Fetching orders for user ID:', userId);
      console.log('User ID type:', typeof userId);
      
      if (!userId || userId === 'undefined') {
        console.error('Invalid user ID:', userId);
        setError('Invalid user ID');
        return;
      }
      
      const transactions = await getUserTransactions(userId);
      
      if (transactions && transactions.length > 0) {
        console.log('Fetched', transactions.length, 'transactions for user');
      }
      
      // Get today's date for filtering
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      // Filter transactions to only show today's orders
      const todaysTransactions = transactions.filter(transaction => {
        const transactionDate = safeParseDate(transaction.created_at);
        return transactionDate >= todayStart && transactionDate < todayEnd;
      });
      
      console.log(`Filtered to ${todaysTransactions.length} orders from today out of ${transactions.length} total transactions`);
      
      // Transform transactions to orders with proper formatting
      const formattedOrders = todaysTransactions.map(transaction => {
        // Get order items from localStorage
        let orderItems = [];
        try {
          const storedItems = localStorage.getItem(`orderItems_${transaction.id}`);
          if (storedItems) {
            orderItems = JSON.parse(storedItems);
          }
        } catch (e) {
          console.log('No stored order items found');
        }

        // Format time using utility functions for robust date handling
        const createdAt = safeParseDate(transaction.created_at);
        const orderTime = formatTime(createdAt);
        const deliveryTime = calculateFutureTime(createdAt, 20);

        return {
          id: transaction.id,
          orderNumber: transaction.order_number,
          tokenNumber: transaction.token_number,
          otp: transaction.otp,
          customer: { 
            name: transaction.user_name || 'Guest', 
            phone: transaction.user_phone || 'N/A' 
          },
          items: orderItems.length > 0 ? orderItems.map(item => ({
            name: item.item_name || item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image_url || item.image || null
          })) : [{ name: 'Order Items', quantity: 1, price: 0, image: null }],
          total: parseFloat(transaction.total_amount) || 0,
          subtotal: parseFloat(transaction.subtotal_amount) || 0,
          serviceFee: parseFloat(transaction.service_fee || 25),
          discount: parseFloat(transaction.discount_amount || 50),
          orderTime: orderTime,
          deliveryTime: deliveryTime,
          paymentStatus: transaction.payment_status || 'pending',
          paymentMethod: transaction.payment_method || 'offline',
          orderStatus: transaction.order_status || 'Pending',
          createdAt: createdAt,
          estimatedPickup: transaction.estimated_pickup_time ? safeParseDate(transaction.estimated_pickup_time) : null,
          pickupLocation: 'MITE Canteen Counter',
          specialInstructions: transaction.special_instructions,
          diningOption: transaction.dining_option
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setError('Failed to load orders');
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Accepted': 'bg-green-100 text-green-700 border-green-200',
      'Cooking': 'bg-orange-100 text-orange-700 border-orange-200',
      'Ready': 'bg-green-100 text-green-700 border-green-200',
      'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'Pending': '⏳',
      'Accepted': '✅',
      'Cooking': '👨‍🍳',
      'Ready': '🎯',
      'Delivered': '🚀',
      'Rejected': '❌'
    };
    return iconMap[status] || '📋';
  };

  const getPaymentStatusColor = (status) => {
    if (status === 'success') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'failed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPaymentMethodIcon = (method) => {
    if (method === 'online') return <CreditCard size={14} />;
    if (method === 'cash') return <Banknote size={14} />;
    if (method === 'card') return <CreditCard size={14} />;
    if (method === 'upi') return <CreditCard size={14} />;
    return <CreditCard size={14} />;
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Show notification for status changes
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Check if we should show new day state based on current time
  const shouldShowNewDayState = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Only show new day state if it's after midnight (00:00) and before 1:00 AM
    // This prevents showing "new day" state during the same day before midnight
    return currentHour === 0 && isNewDay;
  };

  // Manual refresh function for current day orders
  const refreshCurrentDayOrders = () => {
    if (userData && userData.id) {
      console.log('🔄 Manually refreshing current day orders...');
      setIsNewDay(false); // Reset new day flag
      fetchUserOrders(userData.id);
      showNotification('🔄 Orders refreshed for today!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Test Real-time Button and Status */}
        <div className="fixed top-20 left-4 z-50 space-y-2">
          <button
            onClick={() => {
              console.log('🧪 Testing user real-time subscription...');
              console.log('Current orders:', orders);
              console.log('User data:', userData);
              // Force refresh to test
              fetchUserOrders(userData.id);
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
          >
            🧪 Test Real-time
          </button>
          
          {/* Real-time Status Indicator */}
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            realtimeStatus === 'connected' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : realtimeStatus === 'polling'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {realtimeStatus === 'connected' && '🟢 Real-time Active'}
            {realtimeStatus === 'polling' && '🟡 Polling Fallback'}
            {realtimeStatus === 'connecting' && '⚪ Connecting...'}
          </div>
        </div>
        
        {/* Real-time Notifications */}
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <main className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Error Loading Orders</h2>
              <p className="text-gray-600 mb-8 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white mt-8">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header - Compact */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/user/cart')}
                className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                <ArrowLeft size={18} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-xs text-gray-600 mt-0.5">Track all your canteen orders</p>
              </div>
            </div>
            
            {/* View History Button */}
            <button
              onClick={() => navigate('/user/view-history')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              <Calendar className="w-4 h-4" />
              View History
            </button>
            
            {/* Daily Refresh Indicator */}
            <div className="text-xs text-gray-500 text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Refreshed: {currentDate.toLocaleDateString()}</span>
              </div>
              {shouldShowNewDayState() && (
                <div className="text-amber-600 font-medium mt-1">
                  ✨ New Day Started
                </div>
              )}
              <button
                onClick={refreshCurrentDayOrders}
                className="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs transition-colors"
              >
                🔄 Refresh Today
              </button>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {shouldShowNewDayState() ? 'No Orders for Today' : 'No Orders Yet'}
              </h3>
              <p className="text-gray-600 mb-8">
                {shouldShowNewDayState() 
                  ? 'Orders are refreshed daily at midnight. Check View History for past orders!'
                  : 'Start by placing your first order from our delicious menu!'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/user/cart')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
                >
                  Order Now
                </button>
                {shouldShowNewDayState() && (
                  <button
                    onClick={() => navigate('/user/view-history')}
                    className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 hover:shadow-lg transition-all duration-300"
                  >
                    View History
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                  {/* Order Details - Compact Layout */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Column - Order Success + Menu (8/12 width) */}
                      <div className="lg:col-span-8 space-y-3">
                        {/* Order Success Section - Compact */}
                        <div className="rounded-lg p-3 text-black border border-gray-200 bg-white">
                          <div className="flex items-center gap-2 mb-2 border border-green-600 bg-green-600 rounded-md p-1.5">
                            <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <h3 className="text-base text-white font-bold">Order Successful!</h3>
                              <p className="text-white text-xs">Your order has been confirmed</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-black text-xs">Order ID:</span>
                              <span className="font-bold text-sm">#{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black text-xs">Total Amount:</span>
                              <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Status Progress Section - Compact */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-gray-600" />
                            Order Status
                          </h4>
                          
                          {/* Horizontal Progress Bar */}
                          <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200"></div>
                            
                            {/* Progress Fill */}
                            <div className={`absolute top-4 left-6 h-0.5 bg-green-500 transition-all duration-1000 ease-out ${
                              order.orderStatus === 'Pending' ? 'w-0' :
                              order.orderStatus === 'Accepted' ? 'w-1/4' :
                              order.orderStatus === 'Cooking' ? 'w-2/4' :
                              order.orderStatus === 'Ready' ? 'w-3/4' :
                              order.orderStatus === 'Delivered' ? 'w-full' : 'w-0'
                            }`}></div>
                            
                            {/* Status Steps */}
                            <div className="flex justify-between relative">
                              {/* Order Placed */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                                  ['Pending', 'Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                    ? 'bg-green-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                  <h5 className={`font-semibold text-xs mb-0.5 ${
                                    ['Pending', 'Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                  }`}>Order Placed</h5>
                                  <p className="text-xs text-gray-500">Received</p>
                                </div>
                                {['Pending', 'Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus) && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Accepted */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                                  ['Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                    ? 'bg-green-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                  <h5 className={`font-semibold text-xs mb-0.5 ${
                                    ['Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                  }`}>Accepted</h5>
                                  <p className="text-xs text-gray-500">Confirmed</p>
                                </div>
                                {['Accepted', 'Cooking', 'Ready', 'Delivered'].includes(order.orderStatus) && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Cooking */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                                  ['Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                    ? 'bg-green-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  <ChefHat className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                  <h5 className={`font-semibold text-xs mb-0.5 ${
                                    ['Cooking', 'Ready', 'Delivered'].includes(order.orderStatus)
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                  }`}>Cooking</h5>
                                  <p className="text-xs text-gray-500">Preparing</p>
                                </div>
                                {['Cooking', 'Ready', 'Delivered'].includes(order.orderStatus) && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Order Ready */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                                  ['Ready', 'Delivered'].includes(order.orderStatus)
                                    ? 'bg-green-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  <Bell className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                  <h5 className={`font-semibold text-xs mb-0.5 ${
                                    ['Ready', 'Delivered'].includes(order.orderStatus)
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                  }`}>Ready</h5>
                                  <p className="text-xs text-gray-500">Pickup</p>
                                </div>
                                {['Ready', 'Delivered'].includes(order.orderStatus) && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Delivered */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                                  order.orderStatus === 'Delivered'
                                    ? 'bg-green-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  <Truck className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                  <h5 className={`font-semibold text-xs mb-0.5 ${
                                    order.orderStatus === 'Delivered'
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                  }`}>Delivered</h5>
                                  <p className="text-xs text-gray-500">Completed</p>
                                </div>
                                {order.orderStatus === 'Delivered' && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Section - Compact */}
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <ShoppingBag className="w-4 h-4 text-gray-600" />
                            Menu Items
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <img 
                                  src={item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center"} 
                                  alt={item.name} 
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div className="flex-grow">
                                  <h5 className="font-semibold text-gray-900 text-xs">{item.name}</h5>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - OTP/Token + Amount (4/12 width) */}
                      <div className="lg:col-span-4 space-y-3">
                        {/* OTP & Token Section - Compact Black & White Theme */}
                        {order.otp && (
                          <div className="bg-white border border-gray-200 rounded-lg p-2">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                              <CreditCard className="w-3 h-3 text-gray-600" />
                              Collection Details
                            </h4>
                            <div className="space-y-2">
                              <div className="text-center p-2 bg-black rounded-md">
                                <p className="text-xs text-white mb-0.5 opacity-80">OTP Code</p>
                                <p className="text-lg font-bold text-white font-mono">#{order.otp}</p>
                                <p className="text-xs text-white opacity-70">Show this to staff</p>
                              </div>
                              <div className="text-center p-2 bg-white border border-black rounded-md">
                                <p className="text-xs text-black mb-0.5 opacity-80">Token Number</p>
                                <p className="text-lg font-bold text-black font-mono">#tok-{order.tokenNumber}</p>
                                <p className="text-xs text-black opacity-70">Collection number</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Amount Section - Compact */}
                        <div className="bg-white border border-gray-200 rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            Order Summary
                          </h4>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Subtotal:</span>
                              <span className="font-semibold text-gray-900 text-xs">₹{(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Service Fee:</span>
                              <span className="font-semibold text-gray-900 text-xs">₹{(order.serviceFee || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Discount:</span>
                              <span className="text-green-600 font-semibold text-xs">-₹{(order.discount || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">Total:</span>
                                <span className="text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Status - Compact */}
                        <div className="bg-white border border-gray-200 rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 mb-1.5 text-xs">Payment Status</h4>
                          <div className="flex items-center gap-2 mb-1.5">
                            {getPaymentMethodIcon(order.paymentMethod || 'offline')}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              order.paymentStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentStatus === 'success' ? 'Paid' : (order.paymentStatus || 'Pending')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 capitalize">{(order.paymentMethod || 'Offline')} payment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={closeOrderDetails}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Order Details - #{order.orderNumber}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle size={24} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Progress */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-3">Order Progress</h3>
            <div className="space-y-3">
              {['Pending', 'Accepted', 'Cooking', 'Ready', 'Delivered'].map((step, index) => {
                const isCompleted = ['Pending', 'Accepted', 'Cooking', 'Ready', 'Delivered'].indexOf(order.orderStatus) >= index;
                const isCurrent = order.orderStatus === step;
                
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm font-medium ${
                      isCurrent ? 'text-indigo-600 font-semibold' : 
                      isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-600">Name</p>
                <p className="font-medium text-blue-900">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Phone</p>
                <p className="font-medium text-blue-900">{order.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Payment Summary</h3>
            <div className="space-y-2">
                                          <div className="flex justify-between">
                              <span className="text-green-600">Subtotal</span>
                              <span className="font-medium text-green-900">₹{(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600">Service Fee</span>
                              <span className="font-medium text-green-900">₹{(order.serviceFee || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span className="font-medium">-₹{(order.discount || 0).toFixed(2)}</span>
                            </div>
              <div className="border-t border-green-200 pt-2">
                <div className="flex justify-between font-bold text-lg text-green-900">
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-3">Timing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-orange-600">Order Time</p>
                <p className="font-medium text-orange-900">{order.orderTime}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">Estimated Pickup</p>
                <p className="font-medium text-orange-900">{order.deliveryTime}</p>
              </div>
            </div>
          </div>

          {/* OTP Information */}
          {order.otp && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">Collection Details</h3>
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-sm text-purple-600 mb-2">OTP Code</p>
                  <p className="text-3xl font-bold text-purple-900 font-mono">#{order.otp}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600 mb-2">Token Number</p>
                  <p className="text-2xl font-bold text-purple-900 font-mono">#tok-{order.tokenNumber}</p>
                </div>
                <p className="text-xs text-purple-600 mt-3">Show these to collect your order</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;
