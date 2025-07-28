import React from 'react';
import { TrendingUp, Users, Star } from 'lucide-react';

const MostOrderedItems = () => {
    const items = [
        { 
            name: 'Chicken Biryani', 
            orders: 156, 
            revenue: '₹7,800', 
            trend: '+18%',
            customers: 142,
            rating: 4.8
        },
        { 
            name: 'Veg Thali', 
            orders: 134, 
            revenue: '₹5,360', 
            trend: '+12%',
            customers: 128,
            rating: 4.6
        },
        { 
            name: 'Masala Dosa', 
            orders: 98, 
            revenue: '₹2,940', 
            trend: '+22%',
            customers: 89,
            rating: 4.9
        },
        { 
            name: 'Butter Chicken', 
            orders: 87, 
            revenue: '₹4,350', 
            trend: '+15%',
            customers: 76,
            rating: 4.7
        },
        { 
            name: 'Tea & Snacks', 
            orders: 76, 
            revenue: '₹1,140', 
            trend: '+8%',
            customers: 68,
            rating: 4.5
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Most Ordered Items</h3>
                    <p className="text-sm text-gray-500 mt-1">Top dishes by order volume</p>
                </div>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">View All</button>
            </div>
            
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
                                    <span>{item.orders} orders</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Revenue and trend */}
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.revenue}</p>
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <TrendingUp size={12} />
                                <span>{item.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MostOrderedItems; 