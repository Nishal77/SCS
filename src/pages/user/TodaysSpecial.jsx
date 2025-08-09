import React, { useState, useRef, useEffect } from 'react';
import { Star, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// --- Food Item Card Component (Updated with smaller size) ---
const FoodItemCard = ({ item }) => {
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    
    // Get stock status for this product
    const stockStatus = getStockStatus(item.stockAvailable);
    
    const handleAddClick = async () => {
        if (!stockStatus.canOrder) {
            setCartMessage('Product is out of stock');
            setTimeout(() => setCartMessage(''), 3000);
            return;
        }
        
        setAddingToCart(true);
        setCartMessage('');
        
        try {
            const result = await handleAddToCart(navigate, item.id, 1);
            
            if (result.success) {
                setCartMessage('✅ Added to cart successfully!');
                // Don't update local stock here - let the real-time subscription handle it
                // The stock will be updated from the database via real-time updates
            } else {
                setCartMessage(`❌ ${result.error}`);
                // If stock error, refresh the product data to get updated stock
                if (result.error.includes('stock') || result.error.includes('Stock')) {
                    // Trigger a refresh of the product data
                    window.location.reload();
                }
            }
        } catch (error) {
            setCartMessage('❌ Failed to add to cart');
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(false);
            setTimeout(() => setCartMessage(''), 3000);
        }
    };

    return (
        <div className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out group border border-gray-100">
            <div className="relative">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 truncate flex-1 pr-2">{item.name}</h3>
                    {/* Enhanced Stock indicator with wow styling */}
                    <div className="flex items-center flex-shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            item.stockAvailable > 10 ? 'bg-emerald-500 shadow-sm' : 
                            item.stockAvailable > 0 ? 'bg-amber-500 shadow-sm' : 'bg-red-500 shadow-sm'
                        }`}></div>
                        <span className={`text-[10px] font-medium tracking-wide ${
                            item.stockAvailable > 10 
                                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full' : 
                            item.stockAvailable > 0 
                                ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full' : 
                                'text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full'
                        }`}>
                            {item.stockAvailable > 10 ? 'In Stock' : 
                             item.stockAvailable > 0 ? `${item.stockAvailable} left` : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center mt-1.5 text-gray-700">
                    <Star className="w-5 h-5 text-green-600 fill-current" />
                    <span className="ml-1.5 font-semibold">{item.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="font-medium text-sm">{item.deliveryTime}</span>
                </div>
                <p className="mt-1.5 text-gray-500 text-sm truncate">{item.cuisine}</p>
                <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-extrabold text-gray-900">{formatPriceWithCurrency(item.price)}</p>
                        <button 
                            onClick={handleAddClick}
                            disabled={!stockStatus.canOrder || addingToCart}
                            className={`flex items-center gap-2 px-5 py-2.5 border-2 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                stockStatus.canOrder && !addingToCart
                                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md' 
                                    : 'border-gray-200 text-gray-500 cursor-not-allowed bg-gray-50 shadow-sm'
                            }`}
                        >
                            <Plus className={`w-4 h-4 ${!stockStatus.canOrder ? 'opacity-60' : ''}`}/>
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

// --- Draggable Carousel Component ---
const FoodCarousel = ({ children }) => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.offsetWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
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
        const walk = (x - startX) * 2.5; // Multiplier for faster scroll
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="w-full">
            <div
                ref={scrollContainerRef}
                className="food-carousel flex space-x-6 pb-6 overflow-x-auto scrollbar-hide cursor-grab"
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeaveOrUp}
                onMouseUp={onMouseLeaveOrUp}
                onMouseMove={onMouseMove}
            >
                {children}
            </div>
        </div>
    );
};

// --- Main Component to render the carousel ---
const TodaysSpecial = () => {
  const { foodItems, loading, error } = useTodaySpecialData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force a refresh by re-fetching data
    window.location.reload();
  };

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
        {/* Section Header with Navigation */}
        <div className="flex justify-between items-center mb-8">
            {/* Left side - Text */}
            <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Hot Picks of the Day</h2>
                <p className="text-gray-600">Today's most popular and trending items</p>
            </div>
            
            {/* Right side - Navigation Controls */}
            <div className="flex space-x-2">
                <button
                    onClick={() => {
                        const scrollContainer = document.querySelector('.food-carousel');
                        if (scrollContainer) {
                            scrollContainer.scrollBy({
                                left: -scrollContainer.offsetWidth * 0.9,
                                behavior: 'smooth',
                            });
                        }
                    }}
                    className="bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm hover:shadow-md"
                    aria-label="Scroll left"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                    onClick={() => {
                        const scrollContainer = document.querySelector('.food-carousel');
                        if (scrollContainer) {
                            scrollContainer.scrollBy({
                                left: scrollContainer.offsetWidth * 0.9,
                                behavior: 'smooth',
                            });
                        }
                    }}
                    className="bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm hover:shadow-md"
                    aria-label="Scroll right"
                >
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
        
        <FoodCarousel>
            {foodItems.map((item) => (
                <FoodItemCard key={item.id} item={item} />
            ))}
        </FoodCarousel>
      </div>
    </div>
  );
};

export default TodaysSpecial; 