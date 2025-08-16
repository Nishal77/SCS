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
            
            // Get all successful transactions
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('payment_status', 'success');

            if (error) throw error;

            // Process order items from localStorage
            const itemStats = {};
            
            transactions.forEach(transaction => {
                try {
                    const orderItems = JSON.parse(localStorage.getItem(`orderItems_${transaction.id}`) || '[]');
                    orderItems.forEach(item => {
                        const itemName = item.item_name || item.name || 'Unknown Item';
                        const itemPrice = parseFloat(item.price || 0);
                        const quantity = parseInt(item.quantity || 1);
                        
                        if (!itemStats[itemName]) {
                            itemStats[itemName] = {
                                name: itemName,
                                orders: 0,
                                revenue: 0,
                                customers: new Set(),
                                totalQuantity: 0
                            };
                        }
                        
                        itemStats[itemName].orders += 1;
                        itemStats[itemName].revenue += itemPrice * quantity;
                        itemStats[itemName].customers.add(transaction.user_email || 'guest');
                        itemStats[itemName].totalQuantity += quantity;
                    });
                } catch (e) {
                    console.log('Error processing order items for transaction:', transaction.id);
                }
            });

            // Convert to array and sort by revenue
            const sortedItems = Object.values(itemStats)
                .map(item => ({
                    name: item.name,
                    orders: item.orders,
                    revenue: item.revenue,
                    trend: '+0%', // Could calculate trend if we store historical data
                    customers: item.customers.size,
                    rating: 4.5, // Default rating, could be stored in database
                    totalQuantity: item.totalQuantity
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5); // Top 5 items

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
                    <p className="text-sm text-gray-500 mt-1">Top dishes by order volume</p>
                </div>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">View All</button>
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
                    <p className="text-gray-500 text-sm">No orders found</p>
                    <p className="text-gray-400 text-xs mt-1">Most ordered items will appear here when users make orders</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                {/* Rank indicator */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    #{index + 1}
                                </div>
                                
                                {/* Item details */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-yellow-500 fill-current" />
                                            <span className="text-xs text-gray-600">{item.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users size={12} />
                                            <span>{item.customers} customers</span>
                                        </div>
                                        <span>•</span>
                                        <span>{item.totalQuantity} items sold</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Revenue and trend */}
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">₹{item.revenue.toFixed(2)}</p>
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <TrendingUp size={12} />
                                    <span>{item.trend}</span>
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