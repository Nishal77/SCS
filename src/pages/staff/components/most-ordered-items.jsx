import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Star, ShoppingBag } from 'lucide-react';
import supabase from '@/lib/supabase';

const MostOrderedItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMostOrderedItems();
        
        // Set up real-time subscription for updates
        const subscription = supabase
            .channel('most_ordered_items_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                },
                () => {
                    fetchMostOrderedItems();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchMostOrderedItems = async () => {
        try {
            setLoading(true);
            
            // Get current month's date range for monthly data
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            console.log('🔍 Fetching most ordered items for month:', startOfMonth.toLocaleDateString());
            
            // Get all successful transactions for current month
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('payment_status', 'success')
                .gte('created_at', startOfMonth.toISOString());

            if (error) throw error;

            console.log(`📊 Found ${transactions?.length || 0} transactions for current month`);

            // Process order items from transaction.items column and order_items table
            const itemStats = {};
            
            for (const transaction of transactions) {
                let orderItems = [];
                
                // Method 1: Check if items are stored in transaction JSONB column
                if (transaction.items && transaction.items !== null && transaction.items !== '[]') {
                    if (typeof transaction.items === 'string') {
                        try {
                            orderItems = JSON.parse(transaction.items);
                            console.log(`✅ Found ${orderItems.length} items in transaction.items for ${transaction.id}`);
                        } catch (e) {
                            console.log('Error parsing items JSON for transaction:', transaction.id);
                        }
                    } else if (Array.isArray(transaction.items)) {
                        orderItems = transaction.items;
                        console.log(`✅ Found ${orderItems.length} items array in transaction.items for ${transaction.id}`);
                    }
                }
                
                // Method 2: If no items in transaction, check order_items table
                if (orderItems.length === 0) {
                    try {
                        const { data: orderItemsData } = await supabase
                            .from('order_items')
                            .select('*')
                            .eq('transaction_id', transaction.id);
                        
                        if (orderItemsData && orderItemsData.length > 0) {
                            orderItems = orderItemsData.map(item => ({
                                name: item.item_name,
                                price: item.price,
                                quantity: item.quantity,
                                category: item.category
                            }));
                            console.log(`✅ Found ${orderItemsData.length} items in order_items table for ${transaction.id}`);
                        }
                    } catch (e) {
                        console.log('Error fetching order_items for transaction:', transaction.id);
                    }
                }
                
                // Process each item in the order
                orderItems.forEach(item => {
                    const itemName = item.name || item.item_name || 'Unknown Item';
                    const itemPrice = parseFloat(item.price || 0);
                    const quantity = parseInt(item.quantity || 1);
                    
                    if (!itemStats[itemName]) {
                        itemStats[itemName] = {
                            name: itemName,
                            orders: 0,
                            revenue: 0,
                            customers: new Set(),
                            totalQuantity: 0,
                            category: item.category || 'General'
                        };
                    }
                    
                    itemStats[itemName].orders += 1;
                    itemStats[itemName].revenue += itemPrice * quantity;
                    itemStats[itemName].customers.add(transaction.user_email || transaction.user_name || 'guest');
                    itemStats[itemName].totalQuantity += quantity;
                });
            }

            console.log('📈 Processed item stats:', Object.keys(itemStats));

            // Convert to array and sort by total quantity (most ordered)
            const sortedItems = Object.values(itemStats)
                .map(item => ({
                    name: item.name,
                    orders: item.orders,
                    revenue: item.revenue,
                    trend: '+0%', // Could calculate trend if we store historical data
                    customers: item.customers.size,
                    rating: 4.5, // Default rating, could be stored in database
                    totalQuantity: item.totalQuantity,
                    category: item.category
                }))
                .sort((a, b) => b.totalQuantity - a.totalQuantity) // Sort by quantity sold
                .slice(0, 5); // Top 5 items

            console.log('🏆 Top 5 most ordered items:', sortedItems);
            setItems(sortedItems);
        } catch (error) {
            console.error('Error fetching most ordered items:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Most Ordered Items</h3>
                    <p className="text-sm text-gray-500 mt-1">Top dishes by order volume this month</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchMostOrderedItems}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
                    >
                        🔄 Refresh
                    </button>
                    <button className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                        View All
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading most ordered items...</p>
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No orders found</p>
                    <p className="text-gray-400 text-xs mt-1">Most ordered items will appear here when users make orders</p>
                    <p className="text-gray-400 text-xs mt-1">Make sure to add real order data using the "📝 Add Real Order Data" button</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="group relative p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                            {/* Rank indicator with gradient background */}
                            <div className="absolute top-2 left-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg' :
                                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg' :
                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg' :
                                    'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg'
                                }`}>
                                    #{index + 1}
                                </div>
                            </div>
                            
                            {/* Item details */}
                            <div className="ml-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                {item.category}
                                            </span>
                                        </div>
                                        
                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Users size={10} className="text-blue-500" />
                                                <span>{item.customers} customers</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ShoppingBag size={10} className="text-green-500" />
                                                <span>{item.totalQuantity} sold</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp size={10} className="text-orange-500" />
                                                <span>{item.orders} orders</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Revenue and trend */}
                                    <div className="text-right ml-3">
                                        <p className="font-bold text-base text-gray-900">₹{item.revenue.toFixed(0)}</p>
                                        <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                                            <TrendingUp size={10} />
                                            <span>{item.trend}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Revenue</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MostOrderedItems; 