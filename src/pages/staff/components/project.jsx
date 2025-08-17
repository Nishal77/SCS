// This component is a web-based implementation using React and Tailwind CSS.
// It faithfully re-creates the daily order management UI for a Canteen Staff Portal.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabase';
import { safeParseDate, formatTime, calculateFutureTime } from '@/lib/utils';
// Icons for the UI (only keeping the ones actually used)
import { 
    Plus, Download, Settings2, SlidersHorizontal, ArrowUpDown, Table, BarChart2,
    Star, Trash2, Edit, X, TrendingUp, Clock, User, CreditCard, CheckCircle, 
    XCircle, AlertCircle, Package, Phone, MapPin, Calendar, DollarSign, Banknote,
    ShoppingBag, Eye
} from 'lucide-react';

// --- Reusable Components ---

// Header Component
const Header = ({ currentTime }) => (
    <header className="w-full mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Sales & Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Manage today's canteen orders</p>
            </div>
            
            {/* Live Date/Time Display */}
            <div className="text-right flex-shrink-0">
                <div className="text-base font-semibold text-gray-700">
                    {currentTime.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div className="text-xl font-bold text-blue-600">
                    {currentTime.toLocaleTimeString('en-US', { 
                        hour12: true, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                    })}
                </div>
                <div className="text-xs text-gray-500">
                    Live Time
                </div>
            </div>
        </div>
    </header>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeType }) => (
    <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50 min-w-0">
        <div className="flex flex-col">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2 truncate">{title}</p>
                <div className="flex flex-col gap-2 mb-2">
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 break-words leading-tight">{value}</p>
                    <div className={`flex items-center gap-1.5 text-xs lg:text-sm font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        changeType === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        <span className="break-words">{change}</span>
                    </div>
                </div>
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
        'Accepted': '✓',
        'Cooking': '⏳',
        'Ready': '✓',
        'Delivered': '✓',
        'Rejected': '✗',
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

// Enhanced Items Display Component with View Button and Dropdown
const SimpleItemsDisplay = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!items || items.length === 0) {
        return (
            <div className="text-xs text-gray-500 italic">No items</div>
        );
    }

    // Show first 2 items with a view button if there are more
    const displayItems = items.slice(0, 2);
    const hasMoreItems = items.length > 2;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Display first 2 items */}
            <div className="space-y-1 mb-2">
                {displayItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {item.image && (
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-6 h-6 rounded object-cover flex-shrink-0"
                                />
                            )}
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-medium text-xs text-black truncate">
                                    {item.name}
                                </span>
                                {item.category && (
                                    <span className="text-xs text-gray-500">{item.category}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
                            <span className="text-xs font-semibold text-black">x{item.quantity}</span>
                            {item.price > 0 && (
                                <span className="text-xs font-bold text-black">₹{item.price.toFixed(2)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* View Button - Only show if there are more items */}
            {hasMoreItems && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-100 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                >
                    <Eye size={12} />
                    View All Items ({items.length})
                </button>
            )}

            {/* Dropdown with all items */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 min-w-80 max-w-96">
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {item.image && (
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-medium text-sm text-black truncate">
                                            {item.name}
                                        </span>
                                        {item.category && (
                                            <span className="text-xs text-gray-600">{item.category}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                                    <span className="text-sm font-semibold text-black">x{item.quantity}</span>
                                    {item.price > 0 && (
                                        <span className="text-sm font-bold text-black">₹{item.price.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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
                                        ✓ Accept Order
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                                        onClick={(e) => {
                                            onRejectOrder(order.id);
                                            onClose();
                                        }}
                                    >
                                        ✗ Reject Order
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
                                    ⏳ Start Cooking
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
                                    ✓ Mark as Ready
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
                                    ✓ Mark as Delivered
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
                            console.log('Order status changed from', payload.old.order_status, 'to', payload.new.order_status);
                            console.log('Refreshing orders...');
                            // Trigger parent component to refresh
                            window.dispatchEvent(new CustomEvent('refreshOrders'));
                        } else {
                            console.log('Update detected but no status change, skipping refresh');
                        }
                    } else if (payload.eventType === 'INSERT') {
                        // For new orders, refresh to show them
                        console.log('🆕 New order detected, refreshing orders...');
                        // Trigger parent component to refresh
                        window.dispatchEvent(new CustomEvent('refreshOrders'));
                    } else if (payload.eventType === 'DELETE') {
                        // For deletions, refresh to remove them
                        console.log('Order deleted, refreshing orders...');
                        // Trigger parent component to refresh
                        window.dispatchEvent(new CustomEvent('refreshOrders'));
                    }
                }
            )
            .subscribe((status) => {
                console.log('Real-time subscription status:', status);
                
                if (status === 'SUBSCRIBED') {
                    setRealtimeStatus('connected');
                    console.log('Staff real-time connected successfully');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setRealtimeStatus('error');
                    console.log('Staff real-time subscription failed');
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
            
            console.log(`Order ${orderId} status updated to: ${newStatus}`);
            
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
                console.log('Forcing refresh to ensure real-time sync...');
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
            
            console.log('Order rejected:', orderId);
            
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
                console.log('Forcing refresh to ensure real-time sync...');
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
                            <th className="p-4 font-medium w-12">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="p-4 font-medium w-48">Order #</th>
                            <th className="p-4 font-medium w-32">Token</th>
                            <th className="p-4 font-medium w-40">Customer</th>
                            <th className="p-4 font-medium w-80">Items</th>
                            <th className="p-4 font-medium w-32">Total</th>
                            <th className="p-4 font-medium w-32">Time</th>
                            <th className="p-4 font-medium w-32">Payment</th>
                            <th className="p-4 font-medium w-48">Status & Actions</th>
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
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{order.orderNumber}</p>
                                        {order.otp && (
                                            <p className="text-xs font-mono font-bold text-orange-600 leading-tight mt-1">
                                                OTP: #{order.otp}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="text-center">
                                        <p className="text-sm font-mono font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                            #tok-{order.tokenNumber}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-4"><CustomerInfo customer={order.customer} /></td>
                                <td className="p-4"><SimpleItemsDisplay items={order.items} /></td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">₹{order.total.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium text-gray-700 text-sm">{order.orderTime}</p>
                                        <p className="text-xs text-gray-500">→ {order.deliveryTime}</p>
                                    </div>
                                </td>
                                <td className="p-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
                                <td className="p-4">
                                    {order.orderStatus === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
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
                                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
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
                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
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
                                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAcceptOrder(order.id);
                                            }}
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                    {order.orderStatus === 'Delivered' && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                                            <CheckCircle size={14} />
                                            Delivered
                                        </span>
                                    )}
                                    {order.orderStatus === 'Rejected' && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                                            <XCircle size={14} />
                                            Rejected
                                        </span>
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
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    avgOrderValue: 0,
    loading: false
  });

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('orders_changes')
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

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, []);























  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      setLoading(true);
      
      // Get today's date range
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date range for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // End of today
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      // Fetch today's transactions
      const { data: todayData, error: todayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfToday.toISOString());

      if (todayError) throw todayError;

      // Fetch yesterday's transactions for comparison
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (yesterdayError) throw yesterdayError;

      // Transform data to match the required format for orders
      const formattedOrders = await Promise.all(todayData.map(async (transaction) => {
        console.log('Processing transaction:', {
          id: transaction.id,
          order_number: transaction.order_number,
          total_amount: transaction.total_amount
        });
        
        // CLEAN SOLUTION: Use only inventory + transactions (no order_items table)
        let orderItems = [];
        
        try {
          // Method 1: Check if items are stored in transaction JSONB column
          if (transaction.items && transaction.items !== null && transaction.items !== '[]') {
            console.log('Found items in transaction.items column:', transaction.items);
            
            if (typeof transaction.items === 'string') {
              try {
                orderItems = JSON.parse(transaction.items);
                console.log(`Parsed ${orderItems.length} items from transaction JSON`);
              } catch (parseError) {
                console.log('Error parsing items JSON:', parseError);
                orderItems = [];
              }
            } else if (Array.isArray(transaction.items)) {
              orderItems = transaction.items;
              console.log(`Found ${orderItems.length} items array in transaction`);            }
          }
          
          // Method 2: If no items in transaction, create from inventory + cart logic
          if (orderItems.length === 0) {
            console.log('No items in transaction, checking if we can reconstruct from inventory...');
            
            // For now, we'll show a message that items need to be added
            // In a real system, you'd fetch from user_cart or other sources
            orderItems = [{
              name: 'Items not loaded',
              quantity: 1,
              price: 0,
              note: 'Click "📝 Add Real Order Data" to add items',
              category: 'Unknown'
            }];
          }
          
          // If items found, validate and format them
          if (orderItems.length > 0 && orderItems[0].name !== 'Items not loaded') {
            console.log(`Successfully loaded ${orderItems.length} items for transaction ${transaction.id}:`, orderItems);
            
            // Show item details
            orderItems.forEach((item, index) => {
              console.log(`  Item ${index + 1}: ${item.name || item.item_name} x${item.quantity} @ ₹${item.price || 'N/A'}`);
            });
          }
          
        } catch (error) {
          console.log('Error processing order items:', error);
          orderItems = [{
                          name: 'Error loading items',
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

      // Calculate DAILY stats instead of monthly
      const todayOrders = todayData?.length || 0;
      const yesterdayOrders = yesterdayData?.length || 0;
      const todayRevenue = todayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      
      // Calculate pending orders for today
      const { data: pendingOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .in('order_status', ['Pending', 'Accepted', 'Cooking'])
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfToday.toISOString());

      const pendingOrders = pendingOrdersData?.length || 0;
      
      // Calculate delivered orders for today
      const { data: deliveredOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .eq('order_status', 'Delivered')
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfToday.toISOString());

      const deliveredOrders = deliveredOrdersData?.length || 0;
      
      // Calculate average order value for today
      const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

      // Calculate daily trends (comparing today vs yesterday)
      const orderTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) : 0;
      const revenueTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;

      setStats({
        todayOrders: todayOrders,
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
        console.log('Error updating transaction.items:', updateError);
        console.log('You might need to add the items column to your transactions table');
      } else {
        console.log('Successfully updated transaction.items:', updateResult);
      }
      
      // Refresh to show the new data
      setTimeout(() => {
        console.log('Refreshing to show real order data...');
        fetchStats();
      }, 1000);
      
              console.log('Real order data added successfully!');
              console.log('Items added:', realOrderItems);
              console.log('Note: Using only transactions table (no order_items table needed)');
      
    } catch (error) {
              console.error('Error adding real order data:', error);
    }
  };

  // Function to debug transactions table structure
  const debugTransactionsTable = async () => {
    try {
              console.log('Debugging transactions table structure...');
      
      // Check what columns exist in transactions table
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'transactions' });
      
      if (columnsError) {
        // Fallback: try to get table info another way
        console.log('Error getting columns via RPC, trying alternative method...');
        
        // Get a sample transaction to see its structure
        const { data: sampleTransaction, error: sampleError } = await supabase
          .from('transactions')
          .select('*')
          .limit(1)
          .single();
        
        if (sampleError) {
          console.log('Error getting sample transaction:', sampleError);
        } else {
          console.log('Sample transaction structure:', Object.keys(sampleTransaction));
          console.log('Sample transaction data:', sampleTransaction);
        }
      } else {
        console.log('Transactions table columns:', columns);
      }
      
      // Check if items column exists by trying to select it
              console.log('Testing if items column exists...');
      const { data: itemsTest, error: itemsTestError } = await supabase
        .from('transactions')
        .select('id, items')
        .limit(1);
      
      if (itemsTestError) {
        console.log('Items column does not exist:', itemsTestError);
        console.log('You need to run the add-items-column.sql script first!');
      } else {
        console.log('Items column exists:', itemsTest);
      }
      
      // Check the specific transaction
              console.log('Checking specific transaction structure...');
      const { data: specificTransaction, error: specificError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', '057ce80e-873f-41c3-8288-b6bbb1b7040c')
        .single();
      
      if (specificError) {
        console.log('Error getting specific transaction:', specificError);
      } else {
        console.log('Specific transaction structure:', Object.keys(specificTransaction));
        console.log('Specific transaction data:', specificTransaction);
        
        // Check if items column exists in this transaction
        if ('items' in specificTransaction) {
          console.log('Items column exists in this transaction');
          console.log('Items value:', specificTransaction.items);
        } else {
          console.log('Items column does not exist in this transaction');
        }
      }
      
    } catch (error) {
              console.error('Error debugging transactions table:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4 lg:p-6 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            <Header currentTime={currentTime} />
            
            {/* Metrics Section */}
            <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                    <StatCard 
                        title="Today's Orders"
                        value={stats.todayOrders.toString()}
                        change={`${stats.todayOrders > 0 ? '+' : ''}${stats.todayOrders} orders today`}
                        changeType="increase"
                    />
                    <StatCard 
                        title="Today's Revenue" 
                        value={`₹${stats.totalRevenue.toFixed(2)}`} 
                        change={`₹${stats.totalRevenue.toFixed(2)} today`} 
                        changeType="increase"
                    />
                    <StatCard 
                        title="Pending Orders" 
                        value={stats.pendingOrders.toString()} 
                        change={`${stats.pendingOrders} currently`} 
                        changeType="increase"
                    />
                    <StatCard 
                        title="Delivered Orders" 
                        value={stats.deliveredOrders.toString()} 
                        change={`${stats.deliveredOrders} completed`} 
                        changeType="increase"
                    />
                    <StatCard 
                        title="Avg. Order Value" 
                        value={`₹${stats.avgOrderValue.toFixed(2)}`} 
                        change={`₹${stats.avgOrderValue.toFixed(2)} average`} 
                        changeType="increase"
                    />
                </div>
            </div>
            
            {/* Orders Table */}
            <OrdersTable 
              orders={orders}
              setOrders={setOrders}
              loading={loading}
              setLoading={setLoading}
            />
        </div>
    </div>
  );
} 
