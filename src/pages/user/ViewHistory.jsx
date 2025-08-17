import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  Package
} from 'lucide-react';
import { checkAuthStatus } from '../../lib/auth-utils';
import { getUserTransactions } from '../../lib/payment-utils';
import { safeParseDate, formatTime } from '../../lib/utils';

const ViewHistory = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');


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

  // Separate useEffect to fetch order history when userData is available
  useEffect(() => {
    if (userData && userData.id) {
      console.log('User data available, fetching order history for:', userData.id);
      fetchOrderHistory(userData.id);
    }
  }, [userData]);

  const fetchOrderHistory = async (userId) => {
    try {
      console.log('Fetching order history for user ID:', userId);
      
      if (!userId || userId === 'undefined') {
        console.error('Invalid user ID:', userId);
        setError('Invalid user ID');
        return;
      }
      
      const transactions = await getUserTransactions(userId);
      
      if (transactions && transactions.length > 0) {
        console.log('Fetched', transactions.length, 'transactions for user');
      }
      
      // Transform transactions to order history with proper formatting
      const formattedHistory = transactions.map(transaction => {
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

        return {
          id: transaction.id,
          transactionId: transaction.id,
          orderNumber: transaction.order_number,
          tokenNumber: transaction.token_number,
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
          orderDate: createdAt,
          paymentStatus: transaction.payment_status || 'pending',
          paymentMethod: transaction.payment_method || 'offline',
          orderStatus: transaction.order_status || 'Pending',
          createdAt: createdAt,
          specialInstructions: transaction.special_instructions,
          diningOption: transaction.dining_option
        };
      });

      setOrderHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history');
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

  const getPaymentStatusColor = (status) => {
    if (status === 'success') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'failed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };



  // Filter and search orders - only show Delivered and Rejected orders
  const filteredOrders = orderHistory.filter(order => {
    // Only show orders with Delivered or Rejected status
    if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Rejected') {
      return false;
    }
    
    const matchesSearch = order.orderNumber.toString().includes(searchTerm) ||
                         order.transactionId.toString().includes(searchTerm) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.orderStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
                <Package className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Error Loading History</h2>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/user/orders')}
                className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-sm text-gray-600 mt-1">View your completed and rejected orders</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by order number, transaction ID, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              {/* Filter */}
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Orders</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Order History Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by placing your first order from our delicious menu!'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/user/cart')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
                >
                  Order Now
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Transaction Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Menu Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        {/* Transaction Details */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Order #</span>
                              <span className="font-mono font-semibold text-gray-900">#{order.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">TXN ID</span>
                              <span className="font-mono text-sm text-gray-600">{order.transactionId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Token</span>
                              <span className="font-mono text-sm text-gray-600">#{order.tokenNumber}</span>
                            </div>
                          </div>
                        </td>

                        {/* Menu Items */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <img 
                                  src={item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center"} 
                                  alt={item.name} 
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                            )}
                          </div>
                        </td>

                        {/* Order Time */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {order.orderDate ? order.orderDate.toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{order.orderTime}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>

                                  {/* Status */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus === 'success' ? 'Paid' : order.paymentStatus}
              </span>
            </div>
          </td>

                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>


      </main>
      <Footer />
    </div>
  );
};

export default ViewHistory;
