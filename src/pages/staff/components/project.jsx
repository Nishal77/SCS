// This component is a web-based implementation using React and Tailwind CSS.
// It faithfully re-creates the daily order management UI for a Canteen Staff Portal.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState, useEffect, useRef } from 'react';
// Icons for the UI
import { 
    Plus, Download, Settings2, SlidersHorizontal, ArrowUpDown, Table, BarChart2,
    Star, Trash2, Edit, X, TrendingUp, Clock, User, CreditCard, CheckCircle, 
    XCircle, AlertCircle, Package, Phone, MapPin, Calendar, DollarSign, Banknote
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
        'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
        'Preparing': 'bg-orange-100 text-orange-700 border-orange-200',
        'Ready': 'bg-green-100 text-green-700 border-green-200',
        'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
        'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
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

// --- Main Orders Table Component ---
const OrdersTable = () => {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Generate OTPs for each order on mount
    const [orderOtps] = useState(() => Array.from({ length: 6 }, () => generateOTP()));
    const [orderStatuses, setOrderStatuses] = useState(Array(6).fill(''));
    const [countdowns, setCountdowns] = useState(Array(6).fill(null));
    const intervalRef = useRef(null);

    // Improved countdown effect
    useEffect(() => {
        // If any countdown is active, start interval
        if (countdowns.some(val => typeof val === 'number' && val > 0)) {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setCountdowns(prev => prev.map(val => (typeof val === 'number' && val > 0) ? val - 1 : val));
                }, 1000);
            }
        } else {
            // No active countdowns, clear interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [countdowns]);

    const toggleOrder = (id) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
        );
    };

    const handleAcceptOrder = (index) => {
        setOrderStatuses((prev) => {
            const updated = [...prev];
            updated[index] = 'ready';
            return updated;
        });
        setCountdowns((prev) => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };
    const handleRejectOrder = (index) => {
        setOrderStatuses((prev) => {
            const updated = [...prev];
            updated[index] = 'rejected';
            return updated;
        });
        setCountdowns((prev) => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };
    const handleOrderReady = (index) => {
        setOrderStatuses((prev) => {
            const updated = [...prev];
            updated[index] = 'countdown';
            return updated;
        });
        setCountdowns((prev) => {
            const updated = [...prev];
            updated[index] = 300; // 5 minutes
            return updated;
        });
    };
    const handleDeliver = (index) => {
        setOrderStatuses((prev) => {
            const updated = [...prev];
            updated[index] = 'delivered';
            return updated;
        });
        setCountdowns((prev) => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };
    const handleReminder = (index) => {
        setCountdowns((prev) => {
            const updated = [...prev];
            updated[index] = 300;
            return updated;
        });
    };

    // Helper to generate a 6-digit random OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const dailyOrders = [
        {
            id: 1,
            orderNumber: '#ORD-001',
            customer: { name: 'Rahul Kumar', phone: '+91 98765 43210' },
            items: [
                { name: 'Masala Dosa', quantity: 2 },
                { name: 'Filter Coffee', quantity: 1 }
            ],
            total: 145.00,
            orderTime: '10:30 AM',
            deliveryTime: '11:00 AM',
            paymentStatus: 'Paid',
            orderStatus: 'Pending',
        },
        {
            id: 2,
            orderNumber: '#ORD-002',
            customer: { name: 'Priya Sharma', phone: '+91 87654 32109' },
            items: [
                { name: 'Samosa', quantity: 3 },
                { name: 'Veg Puff', quantity: 2 },
                { name: 'Tea', quantity: 1 }
            ],
            total: 95.00,
            orderTime: '10:45 AM',
            deliveryTime: '11:15 AM',
            paymentStatus: 'Cash',
            orderStatus: 'Accepted',
        },
        {
            id: 3,
            orderNumber: '#ORD-003',
            customer: { name: 'Amit Patel', phone: '+91 76543 21098' },
            items: [
                { name: 'Idli Vada', quantity: 1 },
                { name: 'Sambar', quantity: 1 }
            ],
            total: 60.00,
            orderTime: '11:00 AM',
            deliveryTime: '11:30 AM',
            paymentStatus: 'Pending',
            orderStatus: 'Preparing',
        },
        {
            id: 4,
            orderNumber: '#ORD-004',
            customer: { name: 'Neha Singh', phone: '+91 65432 10987' },
            items: [
                { name: 'Paneer Roll', quantity: 2 },
                { name: 'Cold Coffee', quantity: 1 }
            ],
            total: 130.00,
            orderTime: '11:15 AM',
            deliveryTime: '11:45 AM',
            paymentStatus: 'Paid',
            orderStatus: 'Ready',
        },
        {
            id: 5,
            orderNumber: '#ORD-005',
            customer: { name: 'Vikram Mehta', phone: '+91 54321 09876' },
            items: [
                { name: 'Masala Dosa', quantity: 1 },
                { name: 'Coconut Chutney', quantity: 1 },
                { name: 'Filter Coffee', quantity: 1 }
            ],
            total: 85.00,
            orderTime: '11:30 AM',
            deliveryTime: '12:00 PM',
            paymentStatus: 'Failed',
            orderStatus: 'Pending',
        },
        {
            id: 6,
            orderNumber: '#ORD-006',
            customer: { name: 'Sneha Reddy', phone: '+91 43210 98765' },
            items: [
                { name: 'Veg Puff', quantity: 4 },
                { name: 'Tea', quantity: 2 }
            ],
            total: 100.00,
            orderTime: '11:45 AM',
            deliveryTime: '12:15 PM',
            paymentStatus: 'Cash',
            orderStatus: 'Delivered',
        }
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm mt-6">
            {/* Table Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100"><Table size={16} /> Order View</button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold"><SlidersHorizontal size={16} /> Filter</button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold"><ArrowUpDown size={16} /> Sort</button>
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <span>Show Details</span>
                        <div className="w-10 h-5 bg-orange-500 rounded-full p-0.5 flex items-center">
                            <span className="w-4 h-4 bg-white rounded-full shadow-md ml-auto"></span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold"><Settings2 size={16} /> Settings</button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold"><Download size={16} /> Export</button>
                    <button className="flex items-center gap-2 bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-900"><Plus size={16} /> New Order</button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="p-4 font-medium w-10">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="p-4 font-medium">Order #</th>
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Items</th>
                            <th className="p-4 font-medium">Total</th>
                            <th className="p-4 font-medium">Time</th>
                            <th className="p-4 font-medium">Payment</th>
                            <th className="p-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyOrders.map((order, index) => (
                            <tr key={order.id} className={`border-b border-gray-200 hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-3"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrder(order.id)} /></td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{order.orderNumber}</p>
                                        {orderStatuses[index] !== '' && orderStatuses[index] !== 'rejected' && (
                                            <p className="text-base font-mono font-bold text-orange-600 leading-tight mt-0.5">
                                                OTP: {orderOtps[index]}
                                            </p>
                                        )}
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
                                    {orderStatuses[index] === '' && (
                                        <div className="flex gap-2">
                                            <button
                                                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={() => handleAcceptOrder(index)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={() => handleRejectOrder(index)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {orderStatuses[index] === 'ready' && (
                                        <button
                                            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                            onClick={() => handleOrderReady(index)}
                                        >
                                            Order Ready
                                        </button>
                                    )}
                                    {orderStatuses[index] === 'countdown' && (
                                        <div className="flex items-center gap-2">
                                            {countdowns[index] > 0 ? (
                                                <span className="px-4 py-1.5 bg-orange-100 text-orange-700 font-semibold rounded-full text-sm font-mono tracking-widest border border-orange-200">
                                                    {`${String(Math.floor(countdowns[index] / 60)).padStart(2, '0')}:${String(countdowns[index] % 60).padStart(2, '0')}`}
                                                </span>
                                            ) : (
                                                <button
                                                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                    onClick={() => handleReminder(index)}
                                                >
                                                    Reminder
                                                </button>
                                            )}
                                            <button
                                                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full text-sm transition-colors shadow-sm"
                                                onClick={() => handleDeliver(index)}
                                            >
                                                Deliver
                                            </button>
                                        </div>
                                    )}
                                    {orderStatuses[index] === 'delivered' && (
                                        <span className="font-semibold text-green-600 text-sm">Delivered</span>
                                    )}
                                    {orderStatuses[index] === 'rejected' && (
                                        <span className="font-semibold text-red-500 text-sm">Rejected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen font-sans p-6">
        <Header />
        <div className="flex flex-col lg:flex-row gap-6">
            <StatCard 
                title="Today's Orders" 
                value="24" 
                change="+3 from yesterday" 
                changeType="increase" 
                icon={Package}
            />
            <StatCard 
                title="Total Revenue" 
                value="₹3,450" 
                change="+12%" 
                changeType="increase" 
                icon={DollarSign}
            />
            <StatCard 
                title="Pending Orders" 
                value="8" 
                change="-2 from last hour" 
                changeType="decrease" 
                icon={Clock}
            />
            <StatCard 
                title="Avg. Order Value" 
                value="₹143" 
                change="+8%" 
                changeType="increase" 
                icon={TrendingUp}
            />
        </div>
        <OrdersTable />
    </div>
  );
} 