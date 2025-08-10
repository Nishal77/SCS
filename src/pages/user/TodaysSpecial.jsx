import React, { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { handleAddToCart } from '../../lib/auth-utils';
import { formatProductForUser, isProductAvailable, formatPriceWithCurrency, getStockStatus } from '../../lib/image-utils';
import supabase from '../../lib/supabase';

// --- Real Data Hook with Real-time Updates ---
const useTodaySpecialData = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTodaySpecial = async () => {
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
                    .eq('is_todays_special', true)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                // Format products for display
                let formattedProducts = data.map(formatProductForUser);
                
                // If no special products found, show empty state
                if (formattedProducts.length === 0) {
                    formattedProducts = [];
                }
                setFoodItems(formattedProducts);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching today special:', err);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchTodaySpecial();

        // Set up real-time subscription for price updates
        const subscription = supabase
            .channel('inventory_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory',
                    filter: 'is_todays_special=eq.true'
                },
                (payload) => {
                    console.log('Real-time inventory update received:', payload);
                    
                    // Handle different types of changes
                    if (payload.eventType === 'UPDATE') {
                        // Update existing product
                        setFoodItems(prev => prev.map(item => 
                            item.id === payload.new.id 
                                ? formatProductForUser(payload.new)
                                : item
                        ));
                    } else if (payload.eventType === 'INSERT') {
                        // Add new product
                        if (payload.new.is_todays_special) {
                            setFoodItems(prev => [formatProductForUser(payload.new), ...prev]);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        // Remove deleted product
                        setFoodItems(prev => prev.filter(item => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { foodItems, loading, error };
};

// --- Enhanced Food Item Card Component with Original Styling Made Perfect ---
const FoodItemCard = ({ item }) => {
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    
    const stockStatus = getStockStatus(item.stockAvailable);
    
    const handleAddClick = async () => {
        if (!stockStatus.canOrder) return;
        
        setAddingToCart(true);
        setCartMessage('');
        
        try {
            const result = await handleAddToCart(item.id, 1);
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
        <div className={`h-full flex flex-col bg-white shadow-lg border rounded-xl overflow-hidden transition-all duration-300 ${
            !stockStatus.canOrder 
                ? 'opacity-60 grayscale filter saturate-50 bg-gray-50 border-gray-200' 
                : 'border-gray-100'
        }`}>
            <div className="relative h-40 overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                        stockStatus.canOrder ? 'group-hover:scale-105' : ''
                    }`}
                    onError={(e) => {
                        console.log(`❌ Image failed to load for ${item.name}:`, item.image);
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
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                            <span className="text-xs font-semibold text-gray-700 tracking-wide">
                                OUT OF STOCK
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className={`p-3 flex flex-col flex-grow ${
                !stockStatus.canOrder ? 'text-gray-500' : ''
            }`}>
                <div className="flex items-start justify-between">
                    <h3 className={`text-sm font-semibold flex-1 pr-2 break-words leading-snug ${
                        !stockStatus.canOrder ? 'text-gray-500' : 'text-gray-900'
                    }`}>{item.name}</h3>
                    {/* Enhanced Stock indicator with perfect styling */}
                    <div className="flex items-center flex-shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            item.stockAvailable > 10 ? 'bg-emerald-500 shadow-sm' : 
                            item.stockAvailable > 0 ? 'bg-amber-500 shadow-sm' : 'bg-red-500 shadow-sm'
                        }`}></div>
                        <span className={`text-[10px] font-medium tracking-wide px-1.5 py-0.5 rounded-full ${
                            item.stockAvailable > 10 
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 
                            item.stockAvailable > 0 
                                ? 'text-amber-700 bg-amber-50 border border-amber-200' : 
                                'text-red-700 bg-red-50 border border-red-200'
                        }`}>
                            {item.stockAvailable > 10 ? 'In Stock' : 
                             item.stockAvailable > 0 ? `${item.stockAvailable} left` : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                <div className={`flex items-center mt-1.5 ${
                    !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-700'
                }`}>
                    <Star className={`w-5 h-5 fill-current ${
                        !stockStatus.canOrder ? 'text-gray-400' : 'text-green-600'
                    }`} />
                    <span className={`ml-1.5 font-semibold ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{item.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className={`font-medium text-sm ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{item.deliveryTime}</span>
                </div>
                {/* Show full description for Today's Special; hide category */}
                {item.description && (
                    <p className={`mt-1 text-xs whitespace-pre-line break-words leading-relaxed ${
                        !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-600'
                    }`}>{item.description}</p>
                )}
                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between">
                        <p className={`text-lg font-extrabold ${
                            !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-900'
                        }`}>{formatPriceWithCurrency(item.price)}</p>
                        <button 
                            onClick={handleAddClick}
                            disabled={!stockStatus.canOrder || addingToCart}
                            className={`flex items-center gap-2 px-5 py-2.5 border-2 font-semibold rounded-xl transition-all duration-300 transform ${
                                stockStatus.canOrder && !addingToCart
                                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm' 
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100 shadow-sm'
                            }`}
                        >
                            <Plus className={`w-4 h-4 ${!stockStatus.canOrder ? 'opacity-40' : ''}`}/>
                            <span className={!stockStatus.canOrder ? 'text-[11px] tracking-wide' : ''}>
                                {addingToCart ? 'ADDING...' : (stockStatus.canOrder ? 'ADD' : 'OUT OF STOCK')}
                            </span>
                        </button>
                    </div>
                    
                    {/* Enhanced Cart message displayed below the button */}
                    {cartMessage && (
                        <div className={`text-xs px-3 py-2 rounded-lg mt-3 text-center font-medium ${
                            cartMessage.includes('✅') 
                                ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                                : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                        }`}>
                            {cartMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Today's Special Component with Grid Layout ---
const TodaysSpecial = () => {
    const { foodItems, loading, error } = useTodaySpecialData();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Force a refresh by re-fetching data
        window.location.reload();
    };

    // Loading state
    if (loading) {
        return (
            <div className="font-sans">
                <div className="container mx-auto">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600 text-sm">Loading today's special...</p>
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
                            <p className="text-red-600 font-semibold mb-2">Error loading today's special</p>
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

    // Empty state
    if (foodItems.length === 0) {
        return (
            <div className="font-sans">
                <div className="container mx-auto">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">No special items marked for today. Check back later!</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans">
            <div className="container mx-auto">
                {/* Enhanced Header Section */}
                <div className="text-left mb-8">
                  <h2 className="text-xl font-bold text-black mb-1">
                    Hot Picks of the Day
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    Today's most popular and trending items
                  </p>
                </div>
                
                {/* Enhanced Grid Layout - 2 items per row on small/medium screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {foodItems.map((item) => (
                        <FoodItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TodaysSpecial; 