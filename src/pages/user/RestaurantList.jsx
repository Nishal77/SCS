import React, { useState, useMemo, useEffect } from 'react';
import { Star, ChevronDown, SlidersHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleAddToCart } from '../../lib/auth-utils';
import { formatProductForUser, isProductAvailable, formatPriceWithCurrency, getStockStatus } from '../../lib/image-utils';
import supabase from '../../lib/supabase';
import FoodSymbol from '../../components/FoodSymbol';
import { getCategoryFilterImage } from '../../lib/category-utils';

// --- Real Data from Supabase with Real-time Updates ---
const useInventoryData = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
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
                    .neq('is_todays_special', true)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                let formattedProducts = data.map(formatProductForUser).filter(p => !p.isSpecial);
                
                // If no products found, show empty state
                if (formattedProducts.length === 0) {
                    formattedProducts = [];
                }
                setProducts(formattedProducts);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchProducts();

        // Set up real-time subscription for price updates
        const subscription = supabase
            .channel('inventory_changes_restaurant')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory'
                },
                (payload) => {
                    console.log('Real-time inventory update received in RestaurantList:', payload);
                    
                    // Handle different types of changes
                    if (payload.eventType === 'UPDATE') {
                        // If item became today's special, remove it from list
                        if (payload.new.is_todays_special === true) {
                            setProducts(prev => prev.filter(item => item.id !== payload.new.id));
                        } else {
                            // Update or add if not present
                            setProducts(prev => {
                                const exists = prev.some(item => item.id === payload.new.id);
                                const formatted = formatProductForUser(payload.new);
                                return exists
                                    ? prev.map(item => (item.id === payload.new.id ? formatted : item))
                                    : [formatted, ...prev];
                            });
                        }
                    } else if (payload.eventType === 'INSERT') {
                        // Only add if not marked as today's special
                        if (payload.new.is_todays_special !== true) {
                            const formatted = formatProductForUser(payload.new);
                            if (!formatted.isSpecial) {
                                setProducts(prev => [formatted, ...prev]);
                            }
                        }
                    } else if (payload.eventType === 'DELETE') {
                        // Remove deleted product
                        setProducts(prev => prev.filter(item => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { products, loading, error };
};

// --- Filter Bar Component ---
const FilterBar = ({ activeFilter, setActiveFilter }) => {
    const filters = [
        { id: 'all', label: 'All', icon: '🍽️' },
        { id: 'special_items', label: 'Special Items', icon: '⭐' },
        { id: 'combo_pack', label: 'Combo Pack', icon: '🍱' },
        { id: 'juice', label: 'Juice', icon: '🍹' },
        { id: 'milk_shake', label: 'Milk Shake', icon: '🥛' },
        { id: 'icecreams', label: 'Icecreams', icon: '🍦' },
        { id: 'chat_items', label: 'Chat Items', icon: '🍲' },
    ];

    return (
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {filters.map(filter => {
                const categoryImage = getCategoryFilterImage(filter.id);
                return (
                    <button 
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border ${
                            activeFilter === filter.id
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 shadow-sm hover:shadow-md'
                        }`}
                    >
                        {categoryImage && (
                            <img 
                                src={categoryImage} 
                                alt={filter.label}
                                className="w-4 h-4 rounded-full object-cover border border-gray-200"
                            />
                        )}
                        <span className="text-sm">{filter.icon}</span>
                        <span>{filter.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// --- Restaurant Card Component (with Price and Add button, offer removed) ---
const RestaurantCard = ({ restaurant }) => {
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    
    const stockStatus = getStockStatus(restaurant.stockAvailable);
    
    const handleAddClick = async () => {
        if (!stockStatus.canOrder) return;
        
        setAddingToCart(true);
        setCartMessage('');
        
        try {
            const result = await handleAddToCart(restaurant.id, 1);
            if (result.success) {
                setCartMessage('✅ Added to cart successfully!');
                // Refresh page to get updated stock data
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setCartMessage(`❌ ${result.error}`);
                if (result.error.includes('stock') || result.error.includes('Stock')) {
                    // Refresh page to get updated stock data
                    setTimeout(() => window.location.reload(), 2000);
                }
            }
        } catch (error) {
            setCartMessage('❌ Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className={`h-full flex flex-col bg-white shadow-sm border rounded-xl overflow-hidden transition-all duration-300 ${
            !stockStatus.canOrder 
                ? 'opacity-60 grayscale filter saturate-50 bg-gray-50 border-gray-200' 
                : 'hover:shadow-md hover:scale-[1.02] border-gray-100'
        }`}>
            <div className="relative h-40 overflow-hidden">
                <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                        stockStatus.canOrder ? 'group-hover:scale-105' : ''
                    }`}
                    onError={(e) => { 
                        console.log(`❌ Image failed to load for ${restaurant.name}:`, restaurant.image);
                        // Try to load a fallback image
                        if (!e.target.dataset.fallbackAttempted) {
                            e.target.dataset.fallbackAttempted = 'true';
                            e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
                        } else {
                            // If fallback also fails, hide the image
                            e.target.style.display = 'none';
                        }
                    }}
                />
                <div className={`absolute inset-0 transition-all duration-300 ${
                    !stockStatus.canOrder 
                        ? 'bg-gray-900/30' 
                        : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'
                }`}></div>
                
                {/* Overlay for out of stock items */}
                {!stockStatus.canOrder && (
                    <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="text-xs font-semibold text-gray-700 tracking-wide">
                                OUT OF STOCK
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className={`p-4 flex flex-col flex-grow ${
                !stockStatus.canOrder ? 'text-gray-500' : ''
            }`}>
                <div className="flex items-start justify-between">
                    <h3 className={`text-base font-semibold truncate flex-1 pr-2 ${
                        !stockStatus.canOrder ? 'text-gray-500' : 'text-gray-900'
                    }`}>{restaurant.name}</h3>
                    {/* Enhanced Stock indicator with wow styling */}
                    <div className="flex items-center flex-shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            restaurant.stockAvailable > 10 ? 'bg-emerald-500 shadow-sm' : 
                            restaurant.stockAvailable > 0 ? 'bg-amber-500 shadow-sm' : 'bg-red-500 shadow-sm'
                        }`}></div>
                        <span className={`text-[10px] font-medium tracking-wide ${
                            restaurant.stockAvailable > 10 
                                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full' : 
                            restaurant.stockAvailable > 0 
                                ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full' : 
                                'text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full'
                        }`}>
                            {restaurant.stockAvailable > 10 ? 'In Stock' : 
                             restaurant.stockAvailable > 0 ? `${restaurant.stockAvailable} left` : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                <div className={`flex items-center mt-1 ${
                    !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-800'
                }`}>
                    <Star className={`w-4 h-4 fill-current ${
                        !stockStatus.canOrder ? 'text-gray-400' : 'text-green-600'
                    }`} />
                    <span className={`ml-1 font-bold text-sm ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{restaurant.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className={`font-medium text-xs ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{restaurant.deliveryTime}</span>
                </div>
                <p className={`mt-1 text-xs truncate ${
                    !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-500'
                }`}>{restaurant.cuisine}</p>
                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between">
                        <p className={`text-xl font-extrabold ${
                            !stockStatus.canOrder ? 'text-gray-400' : 'text-black'
                        }`}>₹{restaurant.price}</p>
                        <button 
                            onClick={handleAddClick}
                            disabled={!stockStatus.canOrder || addingToCart}
                            className={`flex items-center gap-2 px-5 py-2.5 border-2 font-semibold rounded-xl transition-all duration-300 transform ${
                                stockStatus.canOrder && !addingToCart
                                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95' 
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100 shadow-sm'
                            }`}
                        >
                            <Plus className={`w-4 h-4 ${!stockStatus.canOrder ? 'opacity-40' : ''}`}/>
                            <span className={!stockStatus.canOrder ? 'text-[11px] tracking-wide' : ''}>
                                {addingToCart ? 'ADDING...' : (stockStatus.canOrder ? 'ADD' : 'OUT OF STOCK')}
                            </span>
                        </button>
                    </div>
                    
                    {/* Cart message displayed below the button */}
                    {cartMessage && (
                        <div className={`text-xs px-3 py-2 rounded-lg mt-3 text-center font-medium ${
                            cartMessage.includes('✅') 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {cartMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Restaurant Page Component ---
export default function App() {
    const { products, loading, error } = useInventoryData();
    const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'non-veg'
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'breakfast', 'lunch', etc.
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Force a refresh by re-fetching data
        window.location.reload();
    };

    const filteredRestaurants = useMemo(() => {
        if (loading) return [];
        if (error) return [];
        
        let filtered = products;
        
        // Apply dietary filter
        if (dietaryFilter === 'veg') {
            filtered = filtered.filter(r => r.category.toLowerCase().includes('veg') || r.category.toLowerCase().includes('vegetarian'));
        } else if (dietaryFilter === 'non-veg') {
            filtered = filtered.filter(r => !r.category.toLowerCase().includes('veg') && !r.category.toLowerCase().includes('vegetarian'));
        }
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(r => r.category.toLowerCase().includes(categoryFilter.toLowerCase()));
        }
        
        return filtered;
    }, [dietaryFilter, categoryFilter, products, loading, error]);

    // Loading state
    if (loading) {
        return (
            <div className="font-sans">
                <div className="container mx-auto">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600 text-sm">Loading restaurant menu...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="font-sans">
                <div className="container mx-auto">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <p className="text-red-600 font-semibold mb-2">Error loading restaurant menu</p>
                            <p className="text-gray-600 text-sm mb-4">{error}</p>
                            <button 
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                            >
                                {refreshing ? 'Refreshing...' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Veg/Non-Veg Toggle Component (with FoodSymbol icons)
    const VegToggle = ({ filter, setFilter }) => {
        return (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setFilter(filter === 'veg' ? 'all' : 'veg')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 border ${
                        filter === 'veg' 
                            ? 'bg-green-50 text-green-700 border-green-300 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600 shadow-sm hover:shadow-md'
                    }`}
                >
                    <FoodSymbol type="veg" size="small" />
                </button>
                <button 
                    onClick={() => setFilter(filter === 'non-veg' ? 'all' : 'non-veg')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 border ${
                        filter === 'non-veg' 
                            ? 'bg-red-50 text-red-700 border-red-300 shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm hover:shadow-md'
                    }`}
                >
                    <FoodSymbol type="non-veg" size="small" />
                </button>
            </div>
        );
    };

    return (
        <div className="font-sans">
            <div className="container mx-auto">
                {/* Section Header with Navigation */}
                <div className="flex justify-between items-center mb-8">
                    {/* Left side - Text */}
                    <div className="text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Menu</h2>
                        <p className="text-gray-600">Explore our full menu with all available dishes</p>
                    </div>
                    
                    {/* Right side - Veg/Non-Veg Controls */}
                    <VegToggle filter={dietaryFilter} setFilter={setDietaryFilter} />
                </div>

                {/* Dish Count and Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">All {filteredRestaurants.length} Dishes</p>
                    </div>
                </div>

                {/* --- Filter Bar --- */}
                <div className="mb-8">
                    <FilterBar activeFilter={categoryFilter} setActiveFilter={setCategoryFilter} />
                </div>

                {/* --- Restaurant Grid --- */}
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No menu items found.</p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                    {filteredRestaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
                )}
            </div>
        </div>
    );
} 