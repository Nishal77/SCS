import React, { useState, useEffect, useRef } from 'react';
import { Star, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { handleAddToCart } from '../../lib/auth-utils';
import { formatProductForUser, isProductAvailable, formatPriceWithCurrency, getStockStatus } from '../../lib/image-utils';
import supabase from '../../lib/supabase';
import { useCart } from '../../lib/cart-context';

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
    const { refreshCart } = useCart();
    
    const stockStatus = getStockStatus(item.stockAvailable);
    
    const handleAddClick = async () => {
        if (!stockStatus.canOrder) return;
        
        setAddingToCart(true);
        setCartMessage('');
        
        try {
            const result = await handleAddToCart(item.id, 1);
            if (result.success) {
                setCartMessage('✅ Added to cart successfully!');
                // Refresh cart data globally
                refreshCart();
                // Clear message after 2 seconds
                setTimeout(() => setCartMessage(''), 2000);
            } else {
                setCartMessage(`❌ ${result.error}`);
                if (result.error.includes('stock') || result.error.includes('Stock')) {
                    // Refresh page to get updated stock data
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    // Clear error message after 3 seconds
                    setTimeout(() => setCartMessage(''), 3000);
                }
            }
        } catch (error) {
            setCartMessage('❌ Failed to add to cart');
            setTimeout(() => setCartMessage(''), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className={`h-full flex flex-col bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:ring-gray-900/10 hover:-translate-y-0.5 ${
            !stockStatus.canOrder 
                ? 'opacity-60 grayscale filter saturate-50 bg-gray-50 border-gray-200' 
                : 'border-gray-100'
        }`}>
            <div className="relative h-32 overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-300 brightness-95 ${
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
                        ? 'bg-gray-900/40' 
                        : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
                }`}></div>
                {/* Text overlay at the bottom of the image */}
                <div className="absolute bottom-2 left-3">
                    <h2
                        className="text-white text-2xl font-extrabold tracking-wide"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                    >
                        {`ITEMS AT ${formatPriceWithCurrency(item.price)}`}
                    </h2>
                </div>
                
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
                    <h3 className="text-sm font-semibold text-black flex-1 pr-2 break-words leading-snug g-semibold">
                        {item.name}
                    </h3>
                    {/* top-right empty to keep compact */}
                    <div className="flex-shrink-0" />
                </div>
                <div className={`flex items-center mt-1 user-meta ${
                    !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-700'
                }`}>
                    <Star className={`w-5 h-5 fill-current ${
                        !stockStatus.canOrder ? 'text-gray-400' : 'text-green-600'
                    }`} />
                    <span className={`ml-1 font-semibold ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{item.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className={`font-medium ${
                        !stockStatus.canOrder ? 'text-gray-400' : ''
                    }`}>{item.deliveryTime}</span>
                </div>
                {/* Show full description for Today's Special; hide category */}
                {item.description && (
                    <p className={`mt-1 user-item-desc line-clamp-2 break-words leading-relaxed ${
                        !stockStatus.canOrder ? 'text-gray-400' : 'text-gray-600'
                    }`}>{item.description}</p>
                )}
                <div className="mt-3 pt-1">
                    <div className="flex items-center justify-between">
                        {/* Live stock status pill with pulse */}
                        {(() => {
                            const status = stockStatus.status; // 'in_stock' | 'low_stock' | 'out_of_stock'
                            const pillClasses =
                                status === 'in_stock'
                                    ? 'text-emerald-700 bg-emerald-100/80 ring-1 ring-emerald-200/60'
                                    : status === 'low_stock'
                                    ? 'text-amber-700 bg-amber-100/80 ring-1 ring-amber-200/60'
                                    : 'text-red-700 bg-red-100/80 ring-1 ring-red-200/60';
                            const dot =
                                status === 'in_stock'
                                    ? 'bg-emerald-500'
                                    : status === 'low_stock'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500';
                            return (
                                <span
                                    className={`relative inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12px] font-semibold ${pillClasses}`}
                                    aria-live="polite"
                                >
                                    <span className="relative inline-flex items-center justify-center">
                                        <span className={`absolute inline-flex w-3.5 h-3.5 rounded-full ${dot} opacity-40 animate-ping`}></span>
                                        <span className={`relative w-2.5 h-2.5 rounded-full ${dot}`}></span>
                                    </span>
                                    {stockStatus.label}
                                </span>
                            );
                        })()}
                        <button 
                            onClick={handleAddClick}
                            disabled={!stockStatus.canOrder || addingToCart}
                            className={`inline-flex items-center gap-2 h-9 px-5 border-2 font-semibold rounded-full transition-all duration-300 transform ${
                                stockStatus.canOrder && !addingToCart
                                    ? 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white active:scale-95 bg-white' 
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                            }`}
                        >
                            <Plus className={`w-4 h-4 ${!stockStatus.canOrder ? 'opacity-40' : ''}`}/>
                            <span className={!stockStatus.canOrder ? 'text-[11px] tracking-wide' : 'text-[12px]'}>
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

    // Horizontal scroll refs/states
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Force a refresh by re-fetching data
        window.location.reload();
    };

    const scroll = (dir) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const amount = Math.min(360, el.offsetWidth * 0.85);
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    const onMouseDown = (e) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };
    const onMouseLeaveOrUp = () => {
        if (!scrollContainerRef.current) return;
        setIsDragging(false);
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.removeProperty('user-select');
    };
    const onMouseMove = (e) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // drag speed
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
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
            <div className="container mx-auto pb-6">
                {/* Header with navigation controls */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h2 className="text-xl text-black mb-1 poppins-extrabold">Hot Picks of the Day</h2>
                      <p className="text-sm text-gray-600 poppins-light">Today's most popular and trending items</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white shadow border hover:bg-gray-50"
                        aria-label="Scroll left"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white shadow border hover:bg-gray-50"
                        aria-label="Scroll right"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Horizontal scroll carousel */}
                <div className="relative pb-2">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 lg:gap-8 overflow-x-auto scrollbar-hide cursor-grab px-1 pb-6"
                        onMouseDown={onMouseDown}
                        onMouseLeave={onMouseLeaveOrUp}
                        onMouseUp={onMouseLeaveOrUp}
                        onMouseMove={onMouseMove}
                    >
                        {foodItems.map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-[280px]">
                                <FoodItemCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodaysSpecial; 