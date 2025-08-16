import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { 
  CheckCircle,
  Package,
  Clock,
  MapPin,
  CreditCard,
  DollarSign,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { checkAuthStatus } from '../../lib/auth-utils';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const user = checkAuthStatus();
    if (!user || !user.id) {
      navigate('/auth/login');
      return;
    }

    // Get order data from location state or localStorage
    const orderFromState = location.state?.orderData;
    const orderFromStorage = localStorage.getItem('lastOrderData');
    
    if (orderFromState) {
      setOrderData(orderFromState);
      setLoading(false);
    } else if (orderFromStorage) {
      try {
        setOrderData(JSON.parse(orderFromStorage));
        setLoading(false);
      } catch (error) {
        console.error('Error parsing order data:', error);
        navigate('/user/cart');
      }
    } else {
      // No order data found, redirect to cart
      navigate('/user/cart');
    }
  }, [navigate, location]);

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  const handleBackToMenu = () => {
    navigate('/user/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Order Data</h2>
              <p className="text-gray-600 mb-8">No order information found. Please try again.</p>
              <button
                onClick={() => navigate('/user/cart')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
              <p className="text-sm text-gray-600 mt-1">Your order has been successfully placed</p>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Order Successful!</h2>
                <p className="text-green-100 text-lg">Your order has been confirmed and is being prepared</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-green-100" />
                  <span className="text-green-100 text-sm">Order ID</span>
                </div>
                <p className="text-2xl font-bold">#{orderData.orderNumber || 'N/A'}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-100" />
                  <span className="text-green-100 text-sm">Total Amount</span>
                </div>
                <p className="text-2xl font-bold">₹{(orderData.total || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Order Items */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {orderData.items && orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=50&h=50&fit=crop&crop=center"}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-grow">
                        <h5 className="font-semibold text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Collection Details */}
            <div className="space-y-6">
              {/* OTP & Token */}
              {orderData.otp && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Collection Details
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 mb-1">OTP Code</p>
                      <p className="text-3xl font-bold text-blue-900 font-mono">#{orderData.otp}</p>
                      <p className="text-xs text-blue-500 mt-1">Show this to staff</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-sm text-orange-600 mb-1">Token Number</p>
                      <p className="text-3xl font-bold text-orange-900 font-mono">#tok-{orderData.tokenNumber}</p>
                      <p className="text-xs text-orange-500 mt-1">Collection number</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{(orderData.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Service Fee:</span>
                    <span className="font-semibold text-gray-900">₹{(orderData.serviceFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-green-600 font-semibold">-₹{(orderData.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">₹{(orderData.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Pickup Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">MITE Canteen Counter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">Est. {orderData.deliveryTime || '20 minutes'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewOrders}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              View All Orders
            </button>
            <button
              onClick={handleBackToMenu}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
