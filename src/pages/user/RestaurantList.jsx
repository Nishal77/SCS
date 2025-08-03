import React, { useState, useMemo, useEffect } from 'react';
import { Star, ChevronDown, SlidersHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleAddToCart } from '../../lib/auth-utils';
import { formatProductForUser, isProductAvailable } from '../../lib/image-utils';
import supabase from '../../lib/supabase';

// --- Real Data from Supabase ---
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
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                let formattedProducts = data.map(formatProductForUser);
                
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

        fetchProducts();
    }, []);

    return { products, loading, error };
};

// --- Filter Bar Component ---
const FilterBar = () => {
    const filters = ["Juice", "Snacks", "Offers",];
    return (
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide pb-2">
            <button className="flex-shrink-0 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter</span>
            </button>
            {filters.map(filter => (
                <button key={filter} className={`flex-shrink-0 px-4 py-2 bg-white border rounded-full text-sm font-medium hover:bg-gray-50 transition-colors ${filter === 'Juice' || filter === 'Snacks' ? 'border-amber-500 text-amber-600' : 'border-gray-300 text-gray-700'}`}>
                    {filter === 'Sort By' ? <span className="flex items-center">{filter} <ChevronDown className="w-4 h-4 ml-1" /></span> : filter}
                </button>
            ))}
        </div>
    );
};

// --- Restaurant Card Component (with Price and Add button, offer removed) ---
const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    
    const handleAddClick = () => {
        if (handleAddToCart(navigate)) {
            // User is authenticated, proceed with adding to cart
            console.log('Adding to cart:', restaurant.name);
            // Add your cart logic here
        }
    };

    // Check if product is available
    const isAvailable = isProductAvailable(restaurant);

    return (
    <div className="bg-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out hover:scale-95 active:scale-90 group">
        <div className="relative">
            <img 
                src={restaurant.image} 
                alt={restaurant.name} 
                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" // reduced from h-48 to h-36
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
            {/* Offer removed */}
        </div>
        <div className="p-3 flex flex-col flex-grow"> {/* reduced padding from p-4 to p-3 */}
            <h3 className="text-base font-semibold text-gray-900 truncate">{restaurant.name}</h3> {/* text-lg -> text-base */}
            <div className="flex items-center mt-1 text-gray-800">
                <Star className="w-4 h-4 text-green-600 fill-current" /> {/* w-5 h-5 -> w-4 h-4 */}
                <span className="ml-1 font-bold text-sm">{restaurant.rating}</span> {/* ml-1.5 -> ml-1, text-sm */}
                <span className="mx-2 text-gray-300">•</span>
                <span className="font-medium text-xs">{restaurant.deliveryTime}</span> {/* text-sm -> text-xs */}
            </div>
            <p className="mt-1 text-gray-500 text-xs truncate">{restaurant.cuisine}</p> {/* mt-1.5 -> mt-1, text-sm -> text-xs */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"> {/* mt-4 pt-4 -> mt-3 pt-3 */}
                <p className="text-xl  font-extrabold text-black">₹{restaurant.price}</p> {/* text-xl -> text-lg */}
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

// --- Main Restaurant Page Component ---
export default function App() {
    const { products, loading, error } = useInventoryData();
    const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'non-veg'

    const filteredRestaurants = useMemo(() => {
        if (loading) return [];
        if (error) return [];
        
        if (dietaryFilter === 'all') {
            return products;
        }
        if (dietaryFilter === 'veg') {
            return products.filter(r => r.category.toLowerCase().includes('veg') || r.category.toLowerCase().includes('vegetarian'));
        }
        if (dietaryFilter === 'non-veg') {
            return products.filter(r => !r.category.toLowerCase().includes('veg') && !r.category.toLowerCase().includes('vegetarian'));
        }
    }, [dietaryFilter, products, loading, error]);

    // Veg/Non-Veg Toggle Component (with perfected hover effects)
    const VegToggle = ({ filter, setFilter }) => {
        const baseStyle = "px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 flex items-center gap-2 border";
        const activeVegStyle = "bg-green-100 text-green-700 border-green-200";
        const inactiveVegStyle = "text-gray-500 bg-white border-gray-300 hover:bg-green-50 hover:border-green-100 hover:text-green-600";
        const activeNonVegStyle = "bg-red-100 text-red-700 border-red-200";
        const inactiveNonVegStyle = "text-gray-500 bg-white border-gray-300 hover:bg-red-50 hover:border-red-100 hover:text-red-600";

        return (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setFilter(filter === 'veg' ? 'all' : 'veg')}
                    className={`${baseStyle} ${filter === 'veg' ? activeVegStyle : inactiveVegStyle}`}
                >
                    <span className={`w-4 h-4 border flex items-center justify-center rounded-sm ${filter === 'veg' ? 'border-green-600' : 'border-gray-400'}`}>
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    </span>
                    Veg
                </button>
                <button 
                    onClick={() => setFilter(filter === 'non-veg' ? 'all' : 'non-veg')}
                    className={`${baseStyle} ${filter === 'non-veg' ? activeNonVegStyle : inactiveNonVegStyle}`}
                >
                     <span className={`w-4 h-4 border flex items-center justify-center rounded-sm ${filter === 'non-veg' ? 'border-red-600' : 'border-gray-400'}`}>
                        <span className="w-2.5 h-2.5 bg-red-600" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></span>
                    </span>
                    Non-Veg
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen font-sans">
                <div className="container mx-auto mt-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading menu items...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto mt-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-red-600">Error loading menu items: {error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans">
            <div className="container mx-auto">
                {/* --- Header Section --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">All {filteredRestaurants.length} Dishes</p>
                    </div>
                    <VegToggle filter={dietaryFilter} setFilter={setDietaryFilter} />
                </div>

                {/* --- Filter Bar --- */}
                <div className="mb-8">
                    <FilterBar />
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