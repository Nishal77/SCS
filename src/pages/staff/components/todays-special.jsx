import React, { useState, useEffect, useCallback } from 'react';
import { 
    Star, Plus, Edit, Trash2, X, AlertCircle, CheckCircle, 
    TrendingUp, Clock, Package, Search, Filter, DollarSign, Eye, Heart
} from 'lucide-react';
import { formatImageUrl, generateRandomRating } from '../../../lib/image-utils';
import supabase from '@/lib/supabase';
import IndianClock from './IndianClock';

// Header Component - Redesigned
const Header = ({ onAddNew }) => (
    <header className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100 px-8 py-8 rounded-2xl mb-8">
        <div className="flex justify-between items-center">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Star size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-1">Today's Special</h1>
                        <p className="text-lg text-gray-600">Manage your featured items for the "Hot Picks of the Day" section</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <IndianClock />
                <div className="flex items-center gap-2 text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-200">
                    <TrendingUp size={18} className="text-orange-600" />
                    <span className="text-sm font-semibold">Featured Items</span>
                </div>
                <button 
                    onClick={onAddNew}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <Plus size={20} />
                    Add New Special
                </button>
            </div>
        </div>
    </header>
);

// Stat Card Component - Redesigned
const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200",
        green: "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200",
        orange: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200",
        purple: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200"
    };
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
                    <p className="text-4xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
};

// Special Item Card Component - Completely Redesigned
const SpecialItemCard = ({ item, onToggleSpecial, onEdit }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleSpecial = async () => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('inventory')
                .update({ is_todays_special: !item.is_todays_special })
                .eq('id', item.id);
            
            if (error) throw error;
            onToggleSpecial(item.id, !item.is_todays_special);
        } catch (err) {
            console.error('Error updating special status:', err);
            alert('Failed to update special status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
        if (stock <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    };

    const stockStatus = getStockStatus(item.stock_available || 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group">
            <div className="relative">
                <img 
                    src={formatImageUrl(item.image_url)} 
                    alt={item.item_name} 
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Featured Badge */}
                {item.is_todays_special && (
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                            <Star size={14} className="fill-current" />
                            Featured
                        </span>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={handleToggleSpecial}
                        disabled={isUpdating}
                        className={`p-3 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm ${
                            item.is_todays_special
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-orange-500'
                        }`}
                    >
                        {isUpdating ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Star size={18} className={item.is_todays_special ? 'fill-current' : ''} />
                        )}
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="p-3 bg-white/90 text-gray-600 hover:bg-white hover:text-blue-600 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm"
                    >
                        <Edit size={18} />
                    </button>
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.item_name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock size={14} />
                                {item.min_to_cook || 0} mins
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}>
                                {stockStatus.text}
                            </span>
                            {item.food_type && (
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                    item.food_type === 'veg' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : 'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                    {item.food_type === 'veg' ? '🥬 Veg' : '🍗 Non-Veg'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Engagement & Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {item.stock_available || 0} of {item.stock_constant || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-current" />
                            {generateRandomRating()}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const TodaysSpecial = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            // Only fetch items that are marked as today's special
            const { data, error } = await supabase
                .from('inventory')
                .select(`
                    *,
                    profiles:added_by(
                        id,
                        name,
                        email_name
                    )
                `)
                .eq('is_todays_special', true)  // Only get items marked as special
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error('Error fetching special items:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleToggleSpecial = (itemId, newStatus) => {
        if (!newStatus) {
            // If unmarking as special, remove from the list
            setItems(prev => prev.filter(item => item.id !== itemId));
        } else {
            // If marking as special, update the status
            setItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, is_todays_special: newStatus } : item
            ));
        }
    };

    const handleEdit = (item) => {
        // Navigate to inventory page to edit
        window.location.href = '/staff/inventory';
    };

    const handleAddNew = () => {
        // Navigate to inventory page
        window.location.href = '/staff/inventory';
    };

    // Calculate stats for special items only
    const stats = {
        totalItems: items.length,
        specialItems: items.filter(item => item.is_todays_special).length,
        inStock: items.filter(item => (item.stock_available || 0) > 0).length,
        categories: new Set(items.map(item => item.category)).size
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <Header onAddNew={handleAddNew} />
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading special items...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <Header onAddNew={handleAddNew} />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle size={20} />
                            <span className="font-semibold">Error</span>
                        </div>
                        <p className="text-red-700 mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <Header onAddNew={handleAddNew} />
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Total Items" 
                        value={stats.totalItems} 
                        icon={Package} 
                        color="blue"
                    />
                    <StatCard 
                        title="Featured Items" 
                        value={stats.specialItems} 
                        icon={Star} 
                        color="orange"
                    />
                    <StatCard 
                        title="In Stock" 
                        value={stats.inStock} 
                        icon={CheckCircle} 
                        color="green"
                    />
                    <StatCard 
                        title="Categories" 
                        value={stats.categories} 
                        icon={TrendingUp} 
                        color="purple"
                    />
                </div>

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star size={40} className="text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No special items found</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">Mark items as "Today's Special" in the inventory to see them featured here</p>
                        <button 
                            onClick={handleAddNew}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Go to Inventory
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map(item => (
                            <SpecialItemCard
                                key={item.id}
                                item={item}
                                onToggleSpecial={handleToggleSpecial}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaysSpecial; 