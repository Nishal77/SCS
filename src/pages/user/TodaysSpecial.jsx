import React, { useState, useRef, useEffect } from 'react';
import { Star, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleAddToCart } from '../../lib/auth-utils';
import { formatProductForUser, isProductAvailable } from '../../lib/image-utils';
import supabase from '../../lib/supabase';

// --- Real Data Hook ---
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

        fetchTodaySpecial();
    }, []);

    return { foodItems, loading, error };
};

// --- Food Item Card Component (Updated with smaller size) ---
const FoodItemCard = ({ item }) => {
    const navigate = useNavigate();
    
    const handleAddClick = () => {
        if (handleAddToCart(navigate)) {
            // User is authenticated, proceed with adding to cart
            console.log('Adding to cart:', item.name);
            // Add your cart logic here
        }
    };

    // Check if product is available
    const isAvailable = isProductAvailable(item);

    return (
        <div className="flex-shrink-0 w-72 bg-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out group ">
            <div className="relative">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-36 object-cover transition-transform duration-300 "
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                {/* Offer removed */}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 truncate">{item.name}</h3>
                <div className="flex items-center mt-1.5 text-gray-700">
                    <Star className="w-5 h-5 text-green-600 fill-current" />
                    <span className="ml-1.5 font-semibold">{item.rating}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="font-medium text-sm">{item.deliveryTime}</span>
                </div>
                <p className="mt-1.5 text-gray-500 text-sm truncate">{item.cuisine}</p>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-extrabold text-gray-900">₹{item.price}</p>
                    <button 
                        onClick={handleAddClick}
                        disabled={!isAvailable}
                        className={`flex items-center gap-2 px-4 py-2 border-2 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                            isAvailable 
                                ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Plus className="w-5 h-5"/>
                        {isAvailable ? 'ADD' : 'OUT OF STOCK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Draggable Carousel Component ---
const FoodCarousel = ({ title, children }) => {
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
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-3">
                    <button onClick={() => scroll('left')} className="bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500" aria-label="Scroll left">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={() => scroll('right')} className="bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500" aria-label="Scroll right">
                        <ArrowRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex space-x-6 pb-6 overflow-x-auto scrollbar-hide cursor-grab"
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
              <p className="text-red-600 text-sm">Error loading today's special: {error}</p>
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
        <FoodCarousel title="">
            {foodItems.map((item) => (
                <FoodItemCard key={item.id} item={item} />
            ))}
        </FoodCarousel>
      </div>
    </div>
  );
};

export default TodaysSpecial; 