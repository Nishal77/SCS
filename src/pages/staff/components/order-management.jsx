// This component is a web-based implementation using React and Tailwind CSS.
// It creates a comprehensive order management system with transaction tracking and order status management.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { safeParseDate, formatTime, calculateFutureTime } from '@/lib/utils';
// Icons for the UI
import { 
    CreditCard, Cash, CheckCircle, XCircle, Package, ShoppingBag, 
    Clock, User, Phone, MapPin, Calendar, DollarSign, TrendingUp,
    AlertCircle, Star, Edit, Trash2, Plus, Download, Settings2,
    ArrowUpDown, Table, BarChart2, Star, X, Clock, User, CreditCard
} from 'lucide-react';

// --- Reusable Components ---

// Header Component
const Header = () => (
    <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time order tracking & transaction managementtt</p>
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
                <span>Settings</span>
            </button>
        </div>
    </header>
);

// Transaction Status Badge Component
const TransactionStatusBadge = ({ status }) => {
    const statusStyles = {
        'Paid': 'bg-green-100 text-green-700 border-green-200',
        'Cash': 'bg-blue-100 text-blue-700 border-blue-200',
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Failed': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
        'Cooking': 'bg-orange-100 text-orange-700 border-orange-200',
        'Ready': 'bg-green-100 text-green-700 border-green-200',
        'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
        'Rejected': 'bg-red-100 text-red-700 border-red-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {status}
        </span>
    );
};

// Delivery Type Badge Component
const DeliveryTypeBadge = ({ type }) => {
    const typeStyles = {
        'Takeaway': 'bg-purple-100 text-purple-700 border-purple-200',
        'Parcel': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Dine-in': 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeStyles[type]}`}>
            {type}
        </span>
    );
};

// OTP Display Component
const OTPDisplay = ({ otp }) => (
    <div className="flex items-center gap-1">
        <span className="text-lg font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
            #{otp}
        </span>
        <span className="text-xs text-gray-500">OTP</span>
    </div>
);

// Token Number Display Component
const TokenDisplay = ({ token }) => (
    <div className="flex items-center gap-1">
        <span className="text-lg font-mono font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
            #tok-{token}
        </span>
        <span className="text-xs text-gray-500">Token</span>
    </div>
);

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
    } else if (status === 'Accepted') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onAccept(orderId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-md hover:bg-orange-600 transition-colors"
                >
                    <Package size={14} />
                    Start Cooking
                </button>
            </div>
        );
    } else if (status === 'Cooking') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onAccept(orderId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600 transition-colors"
                >
                    <CheckCircle size={14} />
                    Order Ready
                </button>
            </div>
        );
    } else if (status === 'Ready') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onAccept(orderId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-colors"
                >
                    <Package size={14} />
                    Deliver
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

// --- Transaction Section Component ---
const TransactionSection = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
        
        // Set up real-time subscription for new transactions
        const subscription = supabase
            .channel('transactions_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                },
                (payload) => {
                    console.log('Transaction change detected:', payload);
                    if (payload.eventType === 'INSERT') {
                        // New transaction added
                        fetchTransactions();
                    } else if (payload.eventType === 'UPDATE') {
                        // Transaction updated
                        fetchTransactions();
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            
            // Get all transactions with payment status 'success'
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('payment_status', 'success')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match the required format
            const formattedTransactions = data.map(transaction => {
                // Get order items from localStorage or generate from transaction data
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
                    paymentStatus: transaction.payment_method === 'online' ? 'Paid' : 'Cash',
                    orderTime: orderTime,
                    deliveryTime: deliveryTime,
                    location: 'MITE Canteen'
                };
            });

            setTransactions(formattedTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Transaction & Payment</h2>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100">
                        <Table size={16} /> Transaction View
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading transactions...</p>
                    </div>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No transactions found</p>
                    <p className="text-gray-400 text-xs mt-1">Transactions will appear here when users make payments</p>
                </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="p-3 font-medium">Order #</th>
                            <th className="p-3 font-medium">Token</th>
                            <th className="p-3 font-medium">OTP</th>
                            <th className="p-3 font-medium">Customer</th>
                            <th className="p-3 font-medium">Items</th>
                            <th className="p-3 font-medium">Total</th>
                            <th className="p-3 font-medium">Payment</th>
                            <th className="p-3 font-medium">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{transaction.orderNumber}</p>
                                        <p className="text-xs text-gray-500">{transaction.location}</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <TokenDisplay token={transaction.tokenNumber} />
                                </td>
                                <td className="p-3">
                                    <OTPDisplay otp={transaction.otp} />
                                </td>
                                <td className="p-3">
                                    <CustomerInfo customer={transaction.customer} />
                                </td>
                                <td className="p-3">
                                    <OrderItems items={transaction.items} />
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">₹{transaction.total.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{transaction.items.length} items</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <TransactionStatusBadge status={transaction.paymentStatus} />
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-medium text-gray-700">{transaction.orderTime}</p>
                                        <p className="text-xs text-gray-500">→ {transaction.deliveryTime}</p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};

// --- Order Status Section Component ---
const OrderStatusSection = () => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        
        // Set up real-time subscription for order updates
        const subscription = supabase
            .channel('orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                },
                (payload) => {
                    console.log('Order change detected:', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            
            // Get all transactions with payment status 'success'
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('payment_status', 'success')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match the required format
            const formattedOrders = data.map(transaction => {
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
                    customer: { 
                        name: transaction.user_name || 'Guest', 
                        phone: transaction.user_phone || 'N/A' 
                    },
                    items: orderItems.length > 0 ? orderItems.map(item => ({
                        name: item.item_name || item.name,
                        quantity: item.quantity
                    })) : [{ name: 'Order Items', quantity: 1 }],
                    total: parseFloat(transaction.total_amount),
                    orderStatus: transaction.order_status || 'Pending',
                    deliveryType: transaction.dining_option === 'dine-in' ? 'Dine-in' : 
                                 transaction.dining_option === 'takeaway' ? 'Takeaway' : 'Parcel',
                    orderTime: orderTime,
                    deliveryTime: deliveryTime,
                    location: 'MITE Canteen'
                };
            });

            setOrders(formattedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (id) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
        );
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
            
            // Determine next status based on current status
            if (currentOrder?.order_status === 'Accepted') {
                newStatus = 'Cooking';
            } else if (currentOrder?.order_status === 'Cooking') {
                newStatus = 'Ready';
            } else if (currentOrder?.order_status === 'Ready') {
                newStatus = 'Delivered';
            }

            // Update order status
            const { error } = await supabase
                .from('transactions')
                .update({ order_status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            
            console.log(`Order ${orderId} status updated to: ${newStatus}`);
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleRejectOrder = async (orderId) => {
        try {
            // Update order status to 'Rejected'
            const { error } = await supabase
                .from('transactions')
                .update({ order_status: 'Rejected' })
                .eq('id', orderId);

            if (error) throw error;
            
        console.log('Order rejected:', orderId);
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error rejecting order:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Order Status & Management</h2>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100">
                        <Table size={16} /> Order View
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
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
                            <th className="p-3 font-medium w-10"><input type="checkbox" /></th>
                            <th className="p-3 font-medium">Order #</th>
                            <th className="p-3 font-medium">Customer</th>
                            <th className="p-3 font-medium">Items</th>
                            <th className="p-3 font-medium">Total</th>
                            <th className="p-3 font-medium">Type</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className={`border-b border-gray-200 hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-3"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrder(order.id)} /></td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{order.orderNumber}</p>
                                        <p className="text-xs text-gray-500">{order.location}</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <CustomerInfo customer={order.customer} />
                                </td>
                                <td className="p-3">
                                    <OrderItems items={order.items} />
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <DeliveryTypeBadge type={order.deliveryType} />
                                </td>
                                <td className="p-3">
                                    <OrderStatusBadge status={order.orderStatus} />
                                </td>
                                <td className="p-3">
                                    <ActionButtons 
                                        orderId={order.id}
                                        onAccept={handleAcceptOrder}
                                        onReject={handleRejectOrder}
                                        status={order.orderStatus}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Table Footer */}
            {orders.length > 0 && selectedOrders.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between shadow-inner">
                    <p className="font-semibold text-gray-700">{selectedOrders.length} Orders Selected</p>
                    <div className="flex items-center gap-4">
                        <button className="font-semibold text-gray-700 flex items-center gap-2"><Edit size={16}/> Bulk Update</button>
                        <button className="font-semibold text-red-600 flex items-center gap-2"><Trash2 size={16}/> Delete</button>
                        <button onClick={() => setSelectedOrders([])} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---
export default function OrderManagement() {
    return (
        <div className="bg-gray-100 min-h-screen font-sans p-6">
            <Header />
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column - Transaction Section */}
                <div>
                    <TransactionSection />
                </div>
                
                {/* Right Column - Order Status Section */}
                <div>
                    <OrderStatusSection />
                </div>
            </div>
        </div>
    );
} 