// This component is a web-based implementation using React and Tailwind CSS.
// It faithfully re-creates the daily order management UI for a Canteen Staff Portal.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabase';
import { safeParseDate, formatTime, calculateFutureTime } from '@/lib/utils';
// Icons for the UI
import { 
    Plus, Download, Settings2, SlidersHorizontal, ArrowUpDown, Table, BarChart2,
    Star, Trash2, Edit, X, TrendingUp, Clock, User, CreditCard, CheckCircle, 
    XCircle, AlertCircle, Package, Phone, MapPin, Calendar, DollarSign, Banknote,
    ShoppingBag
} from 'lucide-react';

// --- Reusable Components ---

// Header Component
const Header = () => (
    <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Daily Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage today's canteen orders</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
                <button className="p-2 rounded-full hover:bg-gray-100"><Download size={20} /></button>
                <button className="p-2 rounded-full hover:bg-gray-100"><Settings2 size={20} /></button>
                <div className="flex -space-x-2">
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=S" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 1"/>
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=C" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 2"/>
                </div>
            </div>
            <button className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
                <Settings2 size={16} />
                <span>Order Settings</span>
            </button>
        </div>
    </header>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex-1 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={14} />
                        <span>{change}</span>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Icon size={24} className="text-gray-600" />
            </div>
        </div>
    </div>
);

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
    if (status === 'Paid') {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-xs border border-green-200">
                <CheckCircle size={14} className="text-green-500" />
                Paid
            </span>
        );
    }
    if (status === 'Cash') {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200">
                <Banknote size={14} className="text-blue-500" />
                Cash
            </span>
        );
    }
    return null;
};

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Accepted': 'bg-green-100 text-green-700 border-green-200',
        'Cooking': 'bg-orange-100 text-orange-700 border-orange-200',
        'Ready': 'bg-green-100 text-green-700 border-green-200',
        'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
        'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    
    const statusIcons = {
        'Pending': '⏳',
        'Accepted': '✅',
        'Cooking': '👨‍🍳',
        'Ready': '🎯',
        'Delivered': '🚀',
        'Rejected': '❌',
    };
    
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
            <span>{statusIcons[status]}</span>
            {status}
        </span>
    );
};

// Customer Info Component
const CustomerInfo = ({ customer }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
        </div>
        <div>
            <p className="font-semibold text-gray-800 text-sm">{customer.name}</p>
            <p className="text-xs text-gray-500">{customer.phone}</p>
        </div>
    </div>
);

// Order Items Component
const OrderItems = ({ items }) => (
    <div className="space-y-1">
        {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-500">x{item.quantity}</span>
            </div>
        ))}
    </div>
);

// Action Buttons Component
const ActionButtons = ({ orderId, onAccept, onReject, status }) => {
    if (status === 'Pending') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onAccept(orderId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600 transition-colors"
                >
                    <CheckCircle size={14} />
                    Accept
                </button>
                <button 
                    onClick={() => onReject(orderId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors"
                >
                    <XCircle size={14} />
                    Reject
                </button>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                <Edit size={14} />
                Update
            </button>
        </div>
    );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose, onAcceptOrder, onRejectOrder }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Order Header */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="font-bold text-gray-900">{order.orderNumber}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Token</p>
                            <p className="font-bold text-orange-600">#tok-{order.tokenNumber}</p>
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

                    {/* Order Summary */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Order Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-green-600">Total Amount</p>
                                <p className="font-bold text-green-900">₹{order.total.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Items Count</p>
                                <p className="font-medium text-green-900">{order.items.length} items</p>
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

                    {/* OTP Information */}
                    {order.otp && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-purple-900 mb-3">Collection Details</h3>
                            <div className="text-center">
                                <p className="text-sm text-purple-600 mb-2">OTP Code</p>
                                <p className="text-2xl font-bold text-purple-900 font-mono">#{order.otp}</p>
                                <p className="text-xs text-purple-600 mt-1">Show this to collect the order</p>
                            </div>
                        </div>
                    )}

                    {/* Order Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            {order.orderStatus === 'Pending' && (
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                        onClick={() => {
                                            onAcceptOrder(order.id);
                                            onClose();
                                        }}
                                    >
                                        ✅ Accept Order
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                                        onClick={() => {
                                            onRejectOrder(order.id);
                                            onClose();
                                        }}
                                    >
                                        ❌ Reject Order
                                    </button>
                                </>
                            )}
                            {order.orderStatus === 'Accepted' && (
                                <button
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                                    onClick={() => {
                                        onAcceptOrder(order.id);
                                        onClose();
                                    }}
                                >
                                    👨‍🍳 Start Cooking
                                </button>
                            )}
                            {order.orderStatus === 'Cooking' && (
                                <button
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                    onClick={() => {
                                        onAcceptOrder(order.id);
                                        onClose();
                                    }}
                                >
                                    🎯 Mark as Ready
                                </button>
                            )}
                            {order.orderStatus === 'Ready' && (
                                <button
                                    className="px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                    onClick={() => {
                                        onAcceptOrder(order.id);
                                        onClose();
                                    }}
                                >
                                    🚀 Mark as Delivered
                                </button>
                            )}
                            {['Delivered', 'Rejected'].includes(order.orderStatus) && (
                                <span className="text-gray-500 font-medium">
                                    Order {order.orderStatus.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Orders Table Component ---
const OrdersTable = ({ orders, setOrders, loading, setLoading }) => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const intervalRef = useRef(null);
    const [realtimeStatus, setRealtimeStatus] = useState('connecting'); // 'connecting', 'connected', 'error'

    useEffect(() => {
        // Set up real-time subscription for order updates
        const subscription = supabase
            .channel('sales_orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `payment_status=eq.success` // Only listen to successful payments
                },
                (payload) => {
                    console.log('🔔 Sales order change detected:', payload);
                    console.log('Event type:', payload.eventType);
                    console.log('Old data:', payload.old);
                    console.log('New data:', payload.new);
                    
                    // Handle different types of changes intelligently
                    if (payload.eventType === 'UPDATE') {
                        // For updates, check if it's a status change we care about
                        if (payload.new && payload.old && 
                            payload.new.order_status !== payload.old.order_status) {
                            console.log('✅ Order status changed from', payload.old.order_status, 'to', payload.new.order_status);
                            console.log('🔄 Refreshing orders...');
                            // Trigger parent component to refresh
                            window.dispatchEvent(new CustomEvent('refreshOrders'));
                        } else {
                            console.log('ℹ️ Update detected but no status change, skipping refresh');
                        }
                    } else if (payload.eventType === 'INSERT') {
                        // For new orders, refresh to show them
                        console.log('🆕 New order detected, refreshing orders...');
                        // Trigger parent component to refresh
                        window.dispatchEvent(new CustomEvent('refreshOrders'));
                    } else if (payload.eventType === 'DELETE') {
                        // For deletions, refresh to remove them
                        console.log('🗑️ Order deleted, refreshing orders...');
                        // Trigger parent component to refresh
                        window.dispatchEvent(new CustomEvent('refreshOrders'));
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Real-time subscription status:', status);
                
                if (status === 'SUBSCRIBED') {
                    setRealtimeStatus('connected');
                    console.log('✅ Staff real-time connected successfully');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setRealtimeStatus('error');
                    console.log('❌ Staff real-time subscription failed');
                }
            });

        return () => {
            subscription.unsubscribe();
        };
    }, []);



    const toggleOrder = (id) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
        );
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeOrderDetails = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            // Get current order status
            const { data: currentOrder } = await supabase
                .from('transactions')
                .select('order_status')
                .eq('id', orderId)
                .single();

            let newStatus = 'Accepted';
            let buttonText = 'Processing...';
            
            // Determine next status based on current status
            if (currentOrder?.order_status === 'Accepted') {
                newStatus = 'Cooking';
                buttonText = 'Starting...';
            } else if (currentOrder?.order_status === 'Cooking') {
                newStatus = 'Ready';
                buttonText = 'Marking...';
            } else if (currentOrder?.order_status === 'Ready') {
                newStatus = 'Delivered';
                buttonText = 'Delivering...';
            }

            // Update local state immediately for instant UI feedback
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, orderStatus: newStatus, isProcessing: true }
                        : order
                )
            );

            // Update order status in database
            const { error } = await supabase
                .from('transactions')
                .update({ 
                    order_status: newStatus,
                    updated_at: new Date().toISOString() // Force update timestamp
                })
                .eq('id', orderId);

            if (error) throw error;
            
            console.log(`✅ Order ${orderId} status updated to: ${newStatus}`);
            
            // Remove processing state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, isProcessing: false }
                        : order
                )
            );
            
            // Force a refresh to ensure real-time sync
            setTimeout(() => {
                console.log('🔄 Forcing refresh to ensure real-time sync...');
                window.dispatchEvent(new CustomEvent('refreshOrders'));
            }, 100);
        } catch (error) {
            console.error('Error updating order status:', error);
            // Revert processing state on error
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, isProcessing: false }
                        : order
                )
            );
        }
    };
    const handleRejectOrder = async (orderId) => {
        try {
            // Update local state immediately for instant UI feedback
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, orderStatus: 'Rejected', isProcessing: true }
                        : order
                )
            );

            // Update order status to 'Rejected'
            const { error } = await supabase
                .from('transactions')
                .update({ 
                    order_status: 'Rejected',
                    updated_at: new Date().toISOString() // Force update timestamp
                })
                .eq('id', orderId);

            if (error) throw error;
            
            console.log('❌ Order rejected:', orderId);
            
            // Remove processing state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, isProcessing: false }
                        : order
                )
            );
            
            // Force a refresh to ensure real-time sync
            setTimeout(() => {
                console.log('🔄 Forcing refresh to ensure real-time sync...');
                window.dispatchEvent(new CustomEvent('refreshOrders'));
            }, 100);
        } catch (error) {
            console.error('Error rejecting order:', error);
            // Revert processing state on error
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, isProcessing: false }
                        : order
                )
            );
        }
    };







    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm mt-6">


            {/* Table Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100"><Table size={16} /> Order View</button>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🧪 Testing real-time update...');
                            // Test real-time update by updating a random order
                            if (orders.length > 0) {
                                const testOrder = orders[0];
                                console.log('Testing with order:', testOrder.id);
                                handleAcceptOrder(testOrder.id);
                            }
                        }}
                        className="flex items-center gap-2 bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-yellow-700"
                    >
                        🧪 Test Real-time
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading orders...</p>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No orders found</p>
                    <p className="text-gray-400 text-xs mt-1">Orders will appear here when users make payments</p>
                </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="p-4 font-medium w-10">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="p-4 font-medium">Order #</th>
                                <th className="p-4 font-medium">Token</th>
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Items</th>
                            <th className="p-4 font-medium">Total</th>
                            <th className="p-4 font-medium">Time</th>
                            <th className="p-4 font-medium">Payment</th>
                                <th className="p-4 font-medium">Status & Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            {orders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        selectedOrders.includes(order.id) ? 'bg-blue-50' : 
                                        order.orderStatus === 'Delivered' ? 'bg-green-50' : ''
                                    }`}
                                    onClick={() => openOrderDetails(order)}
                                >
                                    <td className="p-3">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedOrders.includes(order.id)} 
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleOrder(order.id);
                                            }}
                                        />
                                    </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{order.orderNumber}</p>
                                            {order.otp && (
                                            <p className="text-base font-mono font-bold text-orange-600 leading-tight mt-0.5">
                                                    OTP: #{order.otp}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                    <td className="p-3">
                                        <div className="text-center">
                                            <p className="text-lg font-mono font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                #tok-{order.tokenNumber}
                                            </p>
                                        </div>
                                    </td>
                                <td className="p-4"><CustomerInfo customer={order.customer} /></td>
                                <td className="p-4"><OrderItems items={order.items} /></td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium text-gray-700">{order.orderTime}</p>
                                        <p className="text-xs text-gray-500">→ {order.deliveryTime}</p>
                                    </div>
                                </td>
                                <td className="p-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
                                                                    <td className="p-4">
                                        {order.orderStatus === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAcceptOrder(order.id);
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRejectOrder(order.id);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {order.orderStatus === 'Accepted' && (
                                            <button
                                                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                            >
                                                Start Cooking
                                            </button>
                                        )}
                                        {order.orderStatus === 'Cooking' && (
                                            <button
                                                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                            >
                                                Order Ready
                                            </button>
                                        )}
                                        {order.orderStatus === 'Ready' && (
                                            <button
                                                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                            >
                                                Deliver
                                            </button>
                                        )}
                                        {order.orderStatus === 'Delivered' && (
                                            <span className="font-semibold text-green-600 text-sm">Delivered</span>
                                        )}
                                        {order.orderStatus === 'Rejected' && (
                                            <span className="font-semibold text-red-500 text-sm">Rejected</span>
                                        )}
                                    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Table Footer */}
            {selectedOrders.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between shadow-inner">
                    <p className="font-semibold text-gray-700">{selectedOrders.length} Orders Selected</p>
                    <div className="flex items-center gap-4">
                        <button className="font-semibold text-gray-700 flex items-center gap-2"><Edit size={16}/> Bulk Update</button>
                        <button className="font-semibold text-red-600 flex items-center gap-2"><Trash2 size={16}/> Delete</button>
                        <button onClick={() => setSelectedOrders([])} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            <OrderDetailsModal 
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={closeOrderDetails}
                onAcceptOrder={handleAcceptOrder}
                onRejectOrder={handleRejectOrder}
            />
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    avgOrderValue: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for stats updates
    const subscription = supabase
      .channel('sales_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Listen for refresh events from OrdersTable
    const handleRefreshOrders = () => {
      fetchStats();
    };

    window.addEventListener('refreshOrders', handleRefreshOrders);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('refreshOrders', handleRefreshOrders);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      setLoading(true);
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Fetch today's transactions
      const { data: todayData, error: todayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;

      // Fetch yesterday's transactions
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (yesterdayError) throw yesterdayError;

      // Transform data to match the required format for orders
      const formattedOrders = todayData.map(transaction => {
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
            name: item.item_name || item.name,
            quantity: item.quantity
          })) : [{ name: 'Order Items', quantity: 1 }],
          total: parseFloat(transaction.total_amount),
          orderTime: orderTime,
          deliveryTime: deliveryTime,
          paymentStatus: transaction.payment_method === 'online' ? 'Paid' : 'Cash',
          orderStatus: transaction.order_status || 'Pending',
        };
      });

      setOrders(formattedOrders);

      // Calculate stats
      const todayOrders = todayData?.length || 0;
      const yesterdayOrders = yesterdayData?.length || 0;
      const todayRevenue = todayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      
      // Calculate pending orders (Pending, Accepted, Cooking)
      const { data: pendingOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .in('order_status', ['Pending', 'Accepted', 'Cooking']);

      const pendingOrders = pendingOrdersData?.length || 0;
      
      // Calculate delivered orders
      const { data: deliveredOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .eq('order_status', 'Delivered')
        .gte('created_at', today.toISOString());

      const deliveredOrders = deliveredOrdersData?.length || 0;
      
      // Calculate average order value
      const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

      // Calculate trends
      const orderTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) : 0;
      const revenueTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;

      setStats({
        todayOrders,
        totalRevenue: todayRevenue,
        pendingOrders,
        deliveredOrders,
        avgOrderValue,
        loading: false
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-6">
        <Header />
        <div className="flex flex-col lg:flex-row gap-6">
            <StatCard 
                title="Today's Orders" 
                value={stats.todayOrders.toString()} 
                change={`${stats.todayOrders > 0 ? '+' : ''}${stats.todayOrders} from today`} 
                changeType="increase" 
                icon={Package}
            />
            <StatCard 
                title="Total Revenue" 
                value={`₹${stats.totalRevenue.toFixed(0)}`} 
                change={`${stats.totalRevenue > 0 ? '+' : ''}₹${stats.totalRevenue.toFixed(0)}`} 
                changeType="increase" 
                icon={DollarSign}
            />
            <StatCard 
                title="Pending Orders" 
                value={stats.pendingOrders.toString()} 
                change={`${stats.pendingOrders} currently`} 
                changeType="increase" 
                icon={Clock}
            />
            <StatCard 
                title="Delivered Orders" 
                value={stats.deliveredOrders.toString()} 
                change={`${stats.deliveredOrders} completed`} 
                changeType="increase" 
                icon={CheckCircle}
            />
            <StatCard 
                title="Avg. Order Value" 
                value={`₹${stats.avgOrderValue.toFixed(0)}`} 
                change={`₹${stats.avgOrderValue.toFixed(0)} average`} 
                changeType="increase" 
                icon={TrendingUp}
            />
        </div>
        
      
        
        <OrdersTable 
          orders={orders}
          setOrders={setOrders}
          loading={loading}
          setLoading={setLoading}
        />
    </div>
  );
} 