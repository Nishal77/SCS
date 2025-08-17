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
                <div className="flex items-center gap-2">
                    {item.image && (
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-6 h-6 rounded object-cover"
                        />
                    )}
                    <div className="flex flex-col">
                        <span className={`font-medium ${item.note ? 'text-orange-600' : 'text-gray-700'}`}>
                            {item.name}
                        </span>
                        {item.note && (
                            <span className="text-xs text-orange-500 italic">({item.note})</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">x{item.quantity}</span>
                    {item.price > 0 && (
                        <span className="text-xs text-gray-400">₹{item.price.toFixed(2)}</span>
                    )}
                </div>
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
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        {item.image && (
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                            />
                                        )}
                                        <div>
                                            <span className="text-gray-700 font-medium">{item.name}</span>
                                            {item.price > 0 && (
                                                <p className="text-xs text-gray-500">₹{item.price} per item</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-medium text-gray-900">x{item.quantity}</span>
                                        {item.price > 0 && (
                                            <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Total Items:</span>
                                <span className="font-semibold text-gray-900">
                                    {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
                                </span>
                            </div>
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
                                        onClick={(e) => {
                                            onAcceptOrder(order.id);
                                            onClose();
                                        }}
                                    >
                                        ✅ Accept Order
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                                        onClick={(e) => {
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
                                    onClick={(e) => {
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
                                    onClick={(e) => {
                                        onAcceptOrder(order.id);
                                        onClose();
                                    }}
                                >
                                    🎯 Mark as Ready
                                </button>
                            )}
                            {order.orderStatus === 'Ready' && (
                                <button
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                    onClick={(e) => {
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
                            console.log('🔍 Inspecting database schema...');
                            inspectDatabaseSchema();
                        }}
                        className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        🔍 Inspect DB
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔄 Manually refreshing orders with items...');
                            fetchStats(); // This will reload orders with proper item fetching
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        🔄 Refresh Orders
                    </button>
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
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('📝 Adding sample items for testing...');
                            addSampleItems();
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        📝 Add Sample Items
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Deep database investigation...');
                            deepDatabaseInvestigation();
                        }}
                        className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        🔍 Deep DB Check
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🏗️ Creating missing tables...');
                            createMissingTables();
                        }}
                        className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        🏗️ Create Tables
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('📝 Adding sample data to tables...');
                            addSampleDataToTables();
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        📝 Add Sample Data
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Testing item fetching...');
                            testItemFetching();
                        }}
                        className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700"
                    >
                        🔍 Test Items
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('➕ Adding items to specific transaction...');
                            addItemsToSpecificTransaction();
                        }}
                        className="flex items-center gap-2 bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-700"
                    >
                        ➕ Add Items
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Checking items column in transactions table...');
                            addItemsColumnToTransactions();
                        }}
                        className="flex items-center gap-2 bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                        🔍 Check Items Column
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Investigating specific transaction with no items...');
                            investigateSpecificTransaction();
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        🔍 Fix This Order
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Checking inventory table...');
                            checkInventoryTable();
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        🔍 Check Inventory
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('📝 Adding sample inventory items...');
                            addSampleInventoryItems();
                        }}
                        className="flex items-center gap-2 bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-700"
                    >
                        📝 Add Inventory Items
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Checking order details...');
                            checkOrderDetails('057ce80e-873f-41c3-8288-b6bbb1b7040c');
                        }}
                        className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        🔍 Check Order Details
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('📝 Adding real order data...');
                            addRealOrderData();
                        }}
                        className="flex items-center gap-2 bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                        📝 Add Real Order Data
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Debugging transactions table...');
                            debugTransactionsTable();
                        }}
                        className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        🔍 Debug Table Structure
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

  // Function to add sample items for testing purposes
  const addSampleItems = () => {
    if (orders.length > 0) {
      const updatedOrders = orders.map(order => ({
        ...order,
        items: [
          {
            name: 'Burger',
            quantity: 2,
            price: 120.00,
            note: 'Sample item for testing'
          },
          {
            name: 'French Fries',
            quantity: 1,
            price: 80.00,
            note: 'Sample item for testing'
          }
        ]
      }));
      
      setOrders(updatedOrders);
      console.log('✅ Added sample items to all orders for testing');
    }
  };

  // Function to create missing tables for order items
  const createMissingTables = async () => {
    try {
      console.log('🏗️ Starting table creation process...');
      
      // First, let's check what tables exist
      const existingTables = await checkExistingTables();
      console.log('📋 Existing tables:', existingTables);
      
      // Create order_items table if it doesn't exist
      if (!existingTables.includes('order_items')) {
        console.log('🏗️ Creating order_items table...');
        await createOrderItemsTableDirect();
      } else {
        console.log('✅ order_items table already exists');
      }
      
      // Create user_cart table if it doesn't exist
      if (!existingTables.includes('user_cart')) {
        console.log('🏗️ Creating user_cart table...');
        await createUserCartTable();
      } else {
        console.log('✅ user_cart table already exists');
      }
      
      console.log('🏗️ Table creation process complete!');
      
      // Refresh the page to test the new tables
      setTimeout(() => {
        console.log('🔄 Refreshing to test new tables...');
        fetchStats();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error during table creation:', error);
    }
  };

  // Function to check which tables exist
  const checkExistingTables = async () => {
    try {
      const tablesToCheck = [
        'order_items',
        'cart_items', 
        'user_cart',
        'cart',
        'items',
        'menu_items',
        'order_details'
      ];
      
      const existingTables = [];
      
      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables.push(tableName);
          }
        } catch (e) {
          // Table doesn't exist
        }
      }
      
      return existingTables;
    } catch (error) {
      console.error('❌ Error checking existing tables:', error);
      return [];
    }
  };

  // Function to create order_items table directly
  const createOrderItemsTableDirect = async () => {
    try {
      console.log('🏗️ Creating order_items table with direct SQL...');
      
      // Try to insert a test record to create the table
      const { error: insertError } = await supabase
        .from('order_items')
        .insert({
          transaction_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
          item_name: 'Test Item',
          quantity: 1,
          price: 0.00,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.log('❌ Error inserting test record:', insertError);
        console.log('💡 You may need to create the table manually in Supabase dashboard');
        console.log('💡 SQL to create order_items table:');
        console.log(`
          CREATE TABLE order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            transaction_id UUID REFERENCES transactions(id),
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            image_url TEXT,
            category TEXT,
            special_instructions TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else {
        console.log('✅ order_items table created and tested successfully');
        // Clean up test record
        await supabase
          .from('order_items')
          .delete()
          .eq('transaction_id', '00000000-0000-0000-0000-000000000000');
      }
      
    } catch (error) {
      console.error('❌ Error creating order_items table directly:', error);
    }
  };

  // Function to create user_cart table
  const createUserCartTable = async () => {
    try {
      console.log('🏗️ Creating user_cart table...');
      
      // Try to insert a test record to create the table
      const { error: insertError } = await supabase
        .from('user_cart')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
          product_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
          quantity: 1,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.log('❌ Error creating user_cart table:', insertError);
        console.log('💡 You may need to create the table manually in Supabase dashboard');
        console.log('💡 SQL to create user_cart table:');
        console.log(`
          CREATE TABLE user_cart (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            product_id UUID NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else {
        console.log('✅ user_cart table created successfully');
        // Clean up test record
        await supabase
          .from('user_cart')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000');
      }
      
    } catch (error) {
      console.error('❌ Error creating user_cart table:', error);
    }
  };

  // Function to add sample data to the tables
  const addSampleDataToTables = async () => {
    try {
      console.log('📝 Starting to add sample data...');
      
      // First, let's test if the order_items table is accessible
      console.log('🔍 Testing order_items table access...');
      const { data: testData, error: testError } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ order_items table not accessible:', testError);
        console.log('💡 Make sure you have created the table in Supabase with the correct SQL');
        return;
      } else {
        console.log('✅ order_items table is accessible!');
        console.log('📋 Current table structure:', testData.length > 0 ? Object.keys(testData[0]) : 'Empty table');
      }
      
      // Get existing transactions to link items to
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id, user_id, total_amount, order_number')
        .eq('payment_status', 'success')
        .limit(3);
      
      if (transactionError || !transactions || transactions.length === 0) {
        console.log('❌ No transactions found to link items to');
        return;
      }
      
      console.log(`📝 Found ${transactions.length} transactions to add sample items to:`, transactions);
      
      // Add sample items to order_items table
      for (const transaction of transactions) {
        try {
          console.log(`📝 Adding sample items for transaction: ${transaction.order_number} (${transaction.id})`);
          
          const sampleItems = [
            {
              transaction_id: transaction.id,
              item_name: 'Burger',
              quantity: 2,
              price: 120.00,
              category: 'Fast Food',
              created_at: new Date().toISOString()
            },
            {
              transaction_id: transaction.id,
              item_name: 'French Fries',
              quantity: 1,
              price: 80.00,
              category: 'Fast Food',
              created_at: new Date().toISOString()
            }
          ];
          
          const { data: insertedItems, error: insertError } = await supabase
            .from('order_items')
            .insert(sampleItems)
            .select();
          
          if (insertError) {
            console.log(`❌ Error adding sample items for transaction ${transaction.id}:`, insertError);
          } else {
            console.log(`✅ Added ${insertedItems.length} sample items for transaction ${transaction.id}:`, insertedItems);
          }
        } catch (e) {
          console.log(`❌ Error processing transaction ${transaction.id}:`, e);
        }
      }
      
      console.log('📝 Sample data addition complete!');
      
      // Refresh to show the new data
      setTimeout(() => {
        console.log('🔄 Refreshing to show sample data...');
        fetchStats();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error adding sample data:', error);
    }
  };

  // Function to test if items are being fetched correctly
  const testItemFetching = async () => {
    try {
      console.log('🔍 Testing item fetching functionality...');
      
      // Get a sample transaction
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id, order_number, total_amount, items')
        .eq('payment_status', 'success')
        .limit(1)
        .single();
      
      if (transactionError || !transactions) {
        console.log('❌ No transactions found for testing');
        return;
      }
      
      console.log(`🔍 Testing with transaction: ${transactions.order_number} (${transactions.id})`);
      console.log('🔍 Transaction items column:', transactions.items);
      
      // Test fetching items from order_items table
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('transaction_id', transactions.id);
      
      if (orderItemsError) {
        console.log('❌ Error fetching order items:', orderItemsError);
      } else if (orderItems && orderItems.length > 0) {
        console.log(`✅ Found ${orderItems.length} order items:`, orderItems);
        
        // Test the item formatting
        const formattedItems = orderItems.map(item => ({
          name: item.item_name,
          quantity: item.quantity,
          price: item.price,
          image: item.image_url || null,
          category: item.category || 'General'
        }));
        
        console.log('✅ Formatted items for display:', formattedItems);
      } else {
        console.log('ℹ️ No order items found for this transaction');
        console.log('💡 Try adding sample data first using "Add Sample Data" button');
      }
      
    } catch (error) {
      console.error('❌ Error during item testing:', error);
    }
  };

  // Function to add items to a specific transaction for testing
  const addItemsToSpecificTransaction = async () => {
    try {
      console.log('➕ Adding items to specific transaction...');
      
      // Get the first successful transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('id, order_number, total_amount')
        .eq('payment_status', 'success')
        .limit(1)
        .single();
      
      if (transactionError || !transaction) {
        console.log('❌ No transactions found to add items to');
        return;
      }
      
      console.log(`➕ Adding items to transaction: ${transaction.order_number} (${transaction.id})`);
      
      // Create realistic menu items for this transaction
      const menuItems = [
        {
          name: 'Chicken Burger',
          quantity: 2,
          price: 150.00,
          category: 'Fast Food'
        },
        {
          name: 'French Fries',
          quantity: 1,
          price: 80.00,
          category: 'Fast Food'
        },
        {
          name: 'Coca Cola',
          quantity: 2,
          price: 40.00,
          category: 'Beverages'
        }
      ];
      
      // Update the transaction with items directly in the items column
      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transactions')
        .update({ 
          items: menuItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)
        .select();
      
      if (updateError) {
        console.log('❌ Error updating transaction with items:', updateError);
        console.log('💡 Make sure the items column exists in transactions table');
      } else {
        console.log(`✅ Successfully added items to transaction ${transaction.id}:`);
        menuItems.forEach(item => {
          console.log(`  - ${item.name} x${item.quantity} @ ₹${item.price}`);
        });
        
        // Also add items to order_items table for detailed tracking
        try {
          const orderItemsData = menuItems.map(item => ({
            transaction_id: transaction.id,
            item_name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category,
            created_at: new Date().toISOString()
          }));
          
          const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);
          
          if (orderItemsError) {
            console.log('⚠️ Warning: Could not create order_items records:', orderItemsError);
          } else {
            console.log('✅ Also created order_items records for detailed tracking');
          }
        } catch (e) {
          console.log('⚠️ Warning: Could not create order_items records:', e);
        }
        
        // Refresh to show the new items
        setTimeout(() => {
          console.log('🔄 Refreshing to show new items...');
          fetchStats();
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Error adding items to transaction:', error);
    }
  };

  // Function to check and use existing items column in transactions table
  const addItemsColumnToTransactions = async () => {
    try {
      console.log('🔍 Checking items column in transactions table...');
      
      // Check if the items column already exists and what data it contains
      const { data: sampleTransaction, error: checkError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1)
        .single();
      
      if (checkError) {
        console.log('❌ Error checking transactions table:', checkError);
        return;
      }
      
      const hasItemsColumn = 'items' in sampleTransaction;
      console.log(`📋 Current transaction columns:`, Object.keys(sampleTransaction));
      console.log(`🔍 Items column exists: ${hasItemsColumn ? 'Yes' : 'No'}`);
      
      if (hasItemsColumn) {
        console.log('✅ Items column already exists in transactions table!');
        console.log('🔍 Current items data:', sampleTransaction.items);
        console.log('🔍 Items data type:', typeof sampleTransaction.items);
        console.log('🔍 Items data length:', sampleTransaction.items ? sampleTransaction.items.length : 'N/A');
        
        // Check if there are any existing items
        if (sampleTransaction.items && sampleTransaction.items !== '[]' && sampleTransaction.items !== 'null') {
          try {
            const existingItems = typeof sampleTransaction.items === 'string' 
              ? JSON.parse(sampleTransaction.items) 
              : sampleTransaction.items;
            
            if (Array.isArray(existingItems) && existingItems.length > 0) {
              console.log(`✅ Found ${existingItems.length} existing items in the column:`, existingItems);
            } else {
              console.log('ℹ️ Items column exists but is empty');
            }
          } catch (parseError) {
            console.log('ℹ️ Items column exists but contains invalid JSON');
            console.log('🔍 Raw items value:', sampleTransaction.items);
          }
        } else {
          console.log('ℹ️ Items column exists but is empty');
        }
        
        // Let's also check a few more transactions to see if any have items
        console.log('🔍 Checking multiple transactions for items...');
        const { data: moreTransactions, error: moreError } = await supabase
          .from('transactions')
          .select('id, order_number, items')
          .eq('payment_status', 'success')
          .limit(5);
        
        if (!moreError && moreTransactions) {
          moreTransactions.forEach((t, index) => {
            console.log(`Transaction ${index + 1}: ${t.order_number} - Items: ${t.items} (${typeof t.items})`);
          });
        }
        
        console.log('💡 Since the column exists, you can now:');
        console.log('   - Click "➕ Add Items" to add items to a transaction');
        console.log('   - Click "🔄 Refresh Orders" to see existing items');
        
        return;
      }
      
      // If we get here, the column doesn't exist (shouldn't happen based on your error)
      console.log('❌ Items column not found - this is unexpected since you got a column exists error');
      
    } catch (error) {
      console.error('❌ Error checking items column:', error);
    }
  };

  // Function to perform deep database investigation
  const deepDatabaseInvestigation = async () => {
    try {
      console.log('🔍 Starting deep database investigation...');
      
      // Get a sample transaction to investigate
      const { data: sampleTransaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .limit(1)
        .single();
      
      if (transactionError) {
        console.error('❌ Error fetching sample transaction:', transactionError);
        return;
      }
      
      console.log('🔍 Sample transaction for investigation:', sampleTransaction);
      
      // Check all possible table relationships
      const tablesToCheck = [
        'order_items',
        'cart_items', 
        'user_cart',
        'cart',
        'items',
        'menu_items',
        'order_details'
      ];
      
      for (const tableName of tablesToCheck) {
        try {
          console.log(`🔍 Checking table: ${tableName}`);
          
          // Try to get table structure
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log(`❌ Table ${tableName} error:`, tableError);
          } else if (tableData && tableData.length > 0) {
            console.log(`✅ Table ${tableName} structure:`, Object.keys(tableData[0]));
            console.log(`✅ Sample data from ${tableName}:`, tableData[0]);
            
            // Try to find items related to our sample transaction
            const { data: relatedItems, error: relatedError } = await supabase
              .from(tableName)
              .select('*')
              .or(`transaction_id.eq.${sampleTransaction.id},order_id.eq.${sampleTransaction.id},user_id.eq.${sampleTransaction.user_id}`);
            
            if (!relatedError && relatedItems && relatedItems.length > 0) {
              console.log(`🎯 Found ${relatedItems.length} related items in ${tableName}:`, relatedItems);
            } else {
              console.log(`ℹ️ No related items found in ${tableName}`);
            }
          }
        } catch (e) {
          console.log(`❌ Error checking table ${tableName}:`, e);
        }
      }
      
      // Check if there are any foreign key relationships
      console.log('🔍 Checking for foreign key relationships...');
      
      // Try to get items using different possible foreign key names
      const possibleKeys = [
        'transaction_id',
        'order_id', 
        'user_id',
        'cart_id',
        'order_number'
      ];
      
      for (const key of possibleKeys) {
        try {
          const { data: itemsByKey, error: keyError } = await supabase
            .from('order_items')
            .select('*')
            .eq(key, sampleTransaction[key] || sampleTransaction.id);
          
          if (!keyError && itemsByKey && itemsByKey.length > 0) {
            console.log(`🎯 Found items using key ${key}:`, itemsByKey);
          }
        } catch (e) {
          // Key doesn't exist, continue
        }
      }
      
      console.log('🔍 Deep database investigation complete!');
    } catch (error) {
      console.error('❌ Error during deep investigation:', error);
    }
  };

  // Function to inspect database schema and help debug item fetching
  const inspectDatabaseSchema = async () => {
    try {
      console.log('🔍 Starting database schema inspection...');
      
      // Check transactions table structure
      const { data: transactionSample, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);
      
      if (transactionError) {
        console.error('❌ Error fetching transaction sample:', transactionError);
      } else if (transactionSample && transactionSample.length > 0) {
        console.log('📋 Transactions table structure:', Object.keys(transactionSample[0]));
        console.log('📋 Sample transaction data:', transactionSample[0]);
        
        // Check if transaction has any item-related fields
        const transaction = transactionSample[0];
        const itemFields = Object.keys(transaction).filter(key => 
          key.toLowerCase().includes('item') || 
          key.toLowerCase().includes('cart') || 
          key.toLowerCase().includes('menu') ||
          key.toLowerCase().includes('order')
        );
        console.log('🔍 Item-related fields in transactions:', itemFields);
      }

      // Check if order_items table exists and its structure
      try {
        const { data: orderItemsSample, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*')
          .limit(1);
        
        if (orderItemsError) {
          console.log('❌ order_items table error:', orderItemsError);
        } else if (orderItemsSample && orderItemsSample.length > 0) {
          console.log('📋 order_items table structure:', Object.keys(orderItemsSample[0]));
          console.log('📋 Sample order_items data:', orderItemsSample[0]);
        }
      } catch (e) {
        console.log('❌ order_items table not accessible:', e);
      }

      // Check if cart_items table exists and its structure
      try {
        const { data: cartItemsSample, error: cartItemsError } = await supabase
          .from('cart_items')
          .select('*')
          .limit(1);
        
        if (cartItemsError) {
          console.log('❌ cart_items table error:', cartItemsError);
        } else if (cartItemsSample && cartItemsSample.length > 0) {
          console.log('📋 cart_items table structure:', Object.keys(cartItemsSample[0]));
          console.log('📋 Sample cart_items data:', cartItemsSample[0]);
        }
      } catch (e) {
        console.log('❌ cart_items table not accessible:', e);
      }

      // Check if user_cart table exists and its structure
      try {
        const { data: userCartSample, error: userCartError } = await supabase
          .from('user_cart')
          .select('*')
          .limit(1);
        
        if (userCartError) {
          console.log('❌ user_cart table error:', userCartError);
        } else if (userCartSample && userCartSample.length > 0) {
          console.log('📋 user_cart table structure:', Object.keys(userCartSample[0]));
          console.log('📋 Sample user_cart data:', userCartSample[0]);
        }
      } catch (e) {
        console.log('❌ user_cart table not accessible:', e);
      }

      // Check if there are any other tables that might contain order items
      try {
        const { data: tablesList, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (!tablesError && tablesList) {
          const relevantTables = tablesList
            .map(t => t.table_name)
            .filter(name => 
              name.toLowerCase().includes('item') || 
              name.toLowerCase().includes('cart') || 
              name.toLowerCase().includes('menu') ||
              name.toLowerCase().includes('order') ||
              name.toLowerCase().includes('product')
            );
          console.log('🔍 Relevant tables that might contain order items:', relevantTables);
        }
      } catch (e) {
        console.log('❌ Could not fetch table list:', e);
      }

      console.log('🔍 Database schema inspection complete!');
    } catch (error) {
      console.error('❌ Error during schema inspection:', error);
    }
  };

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
      const formattedOrders = await Promise.all(todayData.map(async (transaction) => {
        console.log('🔍 Processing transaction:', {
          id: transaction.id,
          order_number: transaction.order_number,
          total_amount: transaction.total_amount
        });
        
        // CLEAN SOLUTION: Use only inventory + transactions (no order_items table)
        let orderItems = [];
        
        try {
          // Method 1: Check if items are stored in transaction JSONB column
          if (transaction.items && transaction.items !== null && transaction.items !== '[]') {
            console.log('✅ Found items in transaction.items column:', transaction.items);
            
            if (typeof transaction.items === 'string') {
              try {
                orderItems = JSON.parse(transaction.items);
                console.log(`✅ Parsed ${orderItems.length} items from transaction JSON`);
              } catch (parseError) {
                console.log('❌ Error parsing items JSON:', parseError);
                orderItems = [];
              }
            } else if (Array.isArray(transaction.items)) {
              orderItems = transaction.items;
              console.log(`✅ Found ${orderItems.length} items array in transaction`);
            }
          }
          
          // Method 2: If no items in transaction, create from inventory + cart logic
          if (orderItems.length === 0) {
            console.log('ℹ️ No items in transaction, checking if we can reconstruct from inventory...');
            
            // For now, we'll show a message that items need to be added
            // In a real system, you'd fetch from user_cart or other sources
            orderItems = [{
              name: '⚠️ Items not loaded',
              quantity: 1,
              price: 0,
              note: 'Click "📝 Add Real Order Data" to add items',
              category: 'Unknown'
            }];
          }
          
          // If items found, validate and format them
          if (orderItems.length > 0 && orderItems[0].name !== '⚠️ Items not loaded') {
            console.log(`✅ Successfully loaded ${orderItems.length} items for transaction ${transaction.id}:`, orderItems);
            
            // Show item details
            orderItems.forEach((item, index) => {
              console.log(`  Item ${index + 1}: ${item.name || item.item_name} x${item.quantity} @ ₹${item.price || 'N/A'}`);
            });
          }
          
        } catch (error) {
          console.log('❌ Error processing order items:', error);
          orderItems = [{
            name: '❌ Error loading items',
            quantity: 1,
            price: 0,
            note: 'Error occurred while loading order items',
            category: 'Error'
          }];
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
          items: orderItems,
          total: parseFloat(transaction.total_amount),
          orderTime: orderTime,
          deliveryTime: deliveryTime,
          paymentStatus: transaction.payment_method === 'online' ? 'Paid' : 'Cash',
          orderStatus: transaction.order_status || 'Pending',
        };
      }));

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



  // Function to investigate a specific transaction and add items
  const investigateSpecificTransaction = async () => {
    try {
      console.log('🔍 Investigating specific transaction: 057ce80e-873f-41c3-8288-b6bbb1b7040c');
      
      // Get the specific transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', '057ce80e-873f-41c3-8288-b6bbb1b7040c')
        .single();
      
      if (transactionError) {
        console.log('❌ Error fetching specific transaction:', transactionError);
        return;
      }
      
      console.log('🔍 Transaction details:', transaction);
      console.log('🔍 All columns:', Object.keys(transaction));
      console.log('🔍 Items column value:', transaction.items);
      console.log('🔍 Items column type:', typeof transaction.items);
      
      // Check if items column exists and what it contains
      if ('items' in transaction) {
        console.log('✅ Items column exists');
        if (transaction.items && transaction.items !== '[]' && transaction.items !== 'null') {
          console.log('✅ Items column has data:', transaction.items);
        } else {
          console.log('⚠️ Items column is empty or null');
        }
      } else {
        console.log('❌ Items column does not exist');
      }
      
      // Check order_items table for this transaction
      try {
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('transaction_id', '057ce80e-873f-41c3-8288-b6bbb1b7040c');
        
        if (orderItemsError) {
          console.log('❌ Error checking order_items table:', orderItemsError);
        } else if (orderItems && orderItems.length > 0) {
          console.log(`✅ Found ${orderItems.length} items in order_items table:`, orderItems);
        } else {
          console.log('ℹ️ No items found in order_items table for this transaction');
        }
      } catch (e) {
        console.log('❌ Error accessing order_items table:', e);
      }
      
      // Check localStorage for this transaction
      try {
        const localStorageKey = `orderItems_057ce80e-873f-41c3-8288-b6bbb1b7040c`;
        const storedItems = localStorage.getItem(localStorageKey);
        
        if (storedItems) {
          console.log('✅ Found items in localStorage:', storedItems);
        } else {
          console.log('ℹ️ No items found in localStorage for this transaction');
        }
      } catch (e) {
        console.log('❌ Error checking localStorage:', e);
      }
      
      // Now let's add some sample items to this transaction
      console.log('🔍 Adding sample items to this specific transaction...');
      
      const sampleItems = [
        {
          name: 'Chicken Burger',
          quantity: 2,
          price: 150.00,
          category: 'Fast Food',
          image: null
        },
        {
          name: 'French Fries',
          quantity: 1,
          price: 80.00,
          category: 'Fast Food',
          image: null
        },
        {
          name: 'Coca Cola',
          quantity: 2,
          price: 40.00,
          category: 'Beverages',
          image: null
        }
      ];
      
      // Method 1: Update the items column in transactions table
      try {
        console.log('🔍 Updating items column in transactions table...');
        const { data: updatedTransaction, error: updateError } = await supabase
          .from('transactions')
          .update({ 
            items: sampleItems,
            updated_at: new Date().toISOString()
          })
          .eq('id', '057ce80e-873f-41c3-8288-b6bbb1b7040c')
          .select();
        
        if (updateError) {
          console.log('❌ Error updating transactions table:', updateError);
          console.log('💡 This might mean the items column doesn\'t exist yet');
        } else {
          console.log('✅ Successfully updated transactions table with items');
          console.log('Updated transaction:', updatedTransaction);
        }
      } catch (e) {
        console.log('❌ Error updating transactions table:', e);
      }
      
      // Method 2: Create order_items records
      try {
        console.log('🔍 Creating order_items records...');
        const orderItemsData = sampleItems.map(item => ({
          transaction_id: '057ce80e-873f-41c3-8288-b6bbb1b7040c',
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          created_at: new Date().toISOString()
        }));
        
        const { data: insertedItems, error: insertError } = await supabase
          .from('order_items')
          .insert(orderItemsData)
          .select();
        
        if (insertError) {
          console.log('❌ Error creating order_items records:', insertError);
          console.log('💡 This might mean the order_items table doesn\'t exist yet');
        } else {
          console.log(`✅ Successfully created ${insertedItems.length} order_items records`);
          console.log('Inserted items:', insertedItems);
        }
      } catch (e) {
        console.log('❌ Error creating order_items records:', e);
      }
      
      // Method 3: Store in localStorage as backup
      try {
        console.log('🔍 Storing items in localStorage as backup...');
        const localStorageKey = `orderItems_057ce80e-873f-41c3-8288-b6bbb1b7040c`;
        localStorage.setItem(localStorageKey, JSON.stringify(sampleItems));
        console.log('✅ Successfully stored items in localStorage');
      } catch (e) {
        console.log('❌ Error storing in localStorage:', e);
      }
      
      console.log('🔍 Investigation complete! Now refresh the orders to see the items.');
      
    } catch (error) {
      console.error('❌ Error during investigation:', error);
    }
  };

  // Function to check inventory table and display available items
  const checkInventoryTable = async () => {
    try {
      console.log('🔍 Checking inventory table...');
      
      // Check if inventory table exists and what's in it
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(10);
      
      if (inventoryError) {
        console.log('❌ Error accessing inventory table:', inventoryError);
        console.log('💡 The inventory table might not exist or you might not have access');
        return;
      }
      
      if (inventoryItems && inventoryItems.length > 0) {
        console.log(`✅ Found ${inventoryItems.length} items in inventory table:`);
        inventoryItems.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.item_name} - ₹${item.price} (${item.category || 'No category'})`);
        });
        
        // Also check table structure
        console.log('📋 Inventory table structure:', Object.keys(inventoryItems[0]));
        
        // Show sample data for debugging
        console.log('📊 Sample inventory item:', inventoryItems[0]);
      } else {
        console.log('ℹ️ Inventory table exists but is empty');
        console.log('💡 You need to add some items to the inventory table');
      }
      
    } catch (error) {
      console.error('❌ Error checking inventory table:', error);
    }
  };

  // Function to add sample items to inventory table
  const addSampleInventoryItems = async () => {
    try {
      console.log('📝 Adding sample items to inventory table...');
      
      const sampleItems = [
        {
          item_name: 'Chicken Burger',
          description: 'Delicious grilled chicken burger with fresh vegetables',
          price: 150.00,
          category: 'Fast Food',
          stock_available: 50,
          stock_constant: 50
        },
        {
          item_name: 'Veg Burger',
          description: 'Fresh vegetable burger with cheese and special sauce',
          price: 120.00,
          category: 'Fast Food',
          stock_available: 40,
          stock_constant: 40
        },
        {
          item_name: 'French Fries',
          description: 'Crispy golden fries served with ketchup',
          price: 80.00,
          category: 'Fast Food',
          stock_available: 100,
          stock_constant: 100
        },
        {
          item_name: 'Chicken Wings',
          description: 'Spicy chicken wings with dipping sauce',
          price: 200.00,
          category: 'Fast Food',
          stock_available: 30,
          stock_constant: 30
        },
        {
          item_name: 'Pizza Margherita',
          description: 'Classic pizza with tomato sauce and mozzarella',
          price: 250.00,
          category: 'Fast Food',
          stock_available: 25,
          stock_constant: 25
        },
        {
          item_name: 'Coca Cola',
          description: 'Refreshing carbonated soft drink',
          price: 40.00,
          category: 'Beverages',
          stock_available: 200,
          stock_constant: 200
        },
        {
          item_name: 'Sprite',
          description: 'Lemon-lime flavored soft drink',
          price: 40.00,
          category: 'Beverages',
          stock_available: 200,
          stock_constant: 200
        },
        {
          item_name: 'Coffee',
          description: 'Hot brewed coffee with milk and sugar',
          price: 30.00,
          category: 'Beverages',
          stock_available: 100,
          stock_constant: 100
        },
        {
          item_name: 'Tea',
          description: 'Hot tea with milk and sugar',
          price: 25.00,
          category: 'Beverages',
          stock_available: 100,
          stock_constant: 100
        },
        {
          item_name: 'Ice Cream',
          description: 'Vanilla ice cream with chocolate sauce',
          price: 60.00,
          category: 'Desserts',
          stock_available: 50,
          stock_constant: 50
        }
      ];
      
      const { data: insertedItems, error: insertError } = await supabase
        .from('inventory')
        .insert(sampleItems)
        .select();
      
      if (insertError) {
        console.log('❌ Error adding sample inventory items:', insertError);
        console.log('💡 You might need to create the inventory table first');
      } else {
        console.log(`✅ Successfully added ${insertedItems.length} sample inventory items`);
        console.log('📋 Sample items added:');
        insertedItems.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.item_name} - ₹${item.price} (${item.category})`);
        });
        
        // Refresh to show the new items
        setTimeout(() => {
          console.log('🔄 Refreshing to show new inventory items...');
          fetchStats();
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Error adding sample inventory items:', error);
    }
  };

  // Function to check actual order details for a specific transaction
  const checkOrderDetails = async (transactionId) => {
    try {
      console.log(`🔍 Checking order details for transaction: ${transactionId}`);
      
      // Get the full transaction data
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (transactionError) {
        console.log('❌ Error fetching transaction:', transactionError);
        return;
      }
      
      console.log('📋 Full transaction data:', transaction);
      console.log('🔍 Available columns:', Object.keys(transaction));
      
      // Check for items in different possible locations
      console.log('🔍 Checking for items data:');
      
      if (transaction.items) {
        console.log('✅ Found items column:', transaction.items);
        console.log('📊 Items type:', typeof transaction.items);
        console.log('📊 Items value:', transaction.items);
      } else {
        console.log('❌ No items column found');
        console.log('💡 You need to add an items column (JSONB) to your transactions table');
      }
      
      if (transaction.order_items) {
        console.log('✅ Found order_items column:', transaction.order_items);
      } else {
        console.log('❌ No order_items column found');
      }
      
      if (transaction.cart_items) {
        console.log('✅ Found cart_items column:', transaction.cart_items);
      } else {
        console.log('❌ No cart_items column found');
      }
      
      if (transaction.menu_items) {
        console.log('✅ Found menu_items column:', transaction.menu_items);
      } else {
        console.log('❌ No menu_items column found');
      }
      
      // Check if we can find the original cart data
      console.log('🔍 Checking user_cart table...');
      const { data: cartItems, error: cartError } = await supabase
        .from('user_cart')
        .select('*')
        .eq('user_id', transaction.user_id);
      
      if (cartError) {
        console.log('❌ Error accessing user_cart table:', cartError);
      } else if (cartItems && cartItems.length > 0) {
        console.log(`✅ Found ${cartItems.length} items in user_cart:`, cartItems);
      } else {
        console.log('ℹ️ No items found in user_cart table');
      }
      
      // Check inventory table
      console.log('🔍 Checking inventory table...');
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(5);
      
      if (inventoryError) {
        console.log('❌ Error accessing inventory table:', inventoryError);
      } else if (inventoryItems && inventoryItems.length > 0) {
        console.log(`✅ Found ${inventoryItems.length} items in inventory:`, inventoryItems);
      } else {
        console.log('ℹ️ No items found in inventory table');
      }
      
      console.log('💡 RECOMMENDATION: Store order items directly in transaction.items (JSONB) column');
      console.log('💡 No need for separate order_items table - keep it simple with inventory + transactions');
      
    } catch (error) {
      console.error('❌ Error checking order details:', error);
    }
  };

  // Function to add real order data to the problematic transaction
  const addRealOrderData = async () => {
    try {
      console.log('📝 Adding real order data to transaction...');
      
      const transactionId = '057ce80e-873f-41c3-8288-b6bbb1b7040c';
      
      // Real order data that should match what the user actually ordered
      const realOrderItems = [
        {
          name: 'Veg Fried Rice',
          quantity: 1,
          price: 60.00,
          category: 'Main Course',
          image: null,
          special_instructions: null
        },
        {
          name: 'Butter Chicken with Garlic Naan',
          quantity: 1,
          price: 320.00,
          category: 'Main Course',
          image: null,
          special_instructions: null
        },
        {
          name: 'Mutton Biryani & Salan',
          quantity: 2,
          price: 360.00,
          category: 'Main Course',
          image: null,
          special_instructions: null
        },
        {
          name: 'Paneer Masala & Rice',
          quantity: 2,
          price: 280.00,
          category: 'Main Course',
          image: null,
          special_instructions: null
        }
      ];
      
      // Method 1: Update the transaction.items column (JSONB)
      console.log('📝 Updating transaction.items column...');
      const { data: updateResult, error: updateError } = await supabase
        .from('transactions')
        .update({ 
          items: realOrderItems,
          order_status: 'Pending'
        })
        .eq('id', transactionId)
        .select();
      
      if (updateError) {
        console.log('❌ Error updating transaction.items:', updateError);
        console.log('💡 You might need to add the items column to your transactions table');
      } else {
        console.log('✅ Successfully updated transaction.items:', updateResult);
      }
      
      // Refresh to show the new data
      setTimeout(() => {
        console.log('🔄 Refreshing to show real order data...');
        fetchStats();
      }, 1000);
      
      console.log('🎯 Real order data added successfully!');
      console.log('📋 Items added:', realOrderItems);
      console.log('💡 Note: Using only transactions table (no order_items table needed)');
      
    } catch (error) {
      console.error('❌ Error adding real order data:', error);
    }
  };

  // Function to debug transactions table structure
  const debugTransactionsTable = async () => {
    try {
      console.log('🔍 Debugging transactions table structure...');
      
      // Check what columns exist in transactions table
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'transactions' });
      
      if (columnsError) {
        // Fallback: try to get table info another way
        console.log('❌ Error getting columns via RPC, trying alternative method...');
        
        // Get a sample transaction to see its structure
        const { data: sampleTransaction, error: sampleError } = await supabase
          .from('transactions')
          .select('*')
          .limit(1)
          .single();
        
        if (sampleError) {
          console.log('❌ Error getting sample transaction:', sampleError);
        } else {
          console.log('📋 Sample transaction structure:', Object.keys(sampleTransaction));
          console.log('📊 Sample transaction data:', sampleTransaction);
        }
      } else {
        console.log('📋 Transactions table columns:', columns);
      }
      
      // Check if items column exists by trying to select it
      console.log('🔍 Testing if items column exists...');
      const { data: itemsTest, error: itemsTestError } = await supabase
        .from('transactions')
        .select('id, items')
        .limit(1);
      
      if (itemsTestError) {
        console.log('❌ Items column does not exist:', itemsTestError);
        console.log('💡 You need to run the add-items-column.sql script first!');
      } else {
        console.log('✅ Items column exists:', itemsTest);
      }
      
      // Check the specific transaction
      console.log('🔍 Checking specific transaction structure...');
      const { data: specificTransaction, error: specificError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', '057ce80e-873f-41c3-8288-b6bbb1b7040c')
        .single();
      
      if (specificError) {
        console.log('❌ Error getting specific transaction:', specificError);
      } else {
        console.log('📋 Specific transaction structure:', Object.keys(specificTransaction));
        console.log('📊 Specific transaction data:', specificTransaction);
        
        // Check if items column exists in this transaction
        if ('items' in specificTransaction) {
          console.log('✅ Items column exists in this transaction');
          console.log('📊 Items value:', specificTransaction.items);
        } else {
          console.log('❌ Items column does not exist in this transaction');
        }
      }
      
    } catch (error) {
      console.error('❌ Error debugging transactions table:', error);
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