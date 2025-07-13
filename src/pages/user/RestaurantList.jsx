import React, { useState, useMemo } from 'react';
import { Star, ChevronDown, SlidersHorizontal, Plus } from 'lucide-react';

// --- Mock Data ---
// Removed 'offer' from each restaurant object
const allRestaurants = [
    { name: 'Burger King', image: 'https://images.unsplash.com/photo-1606131731446-5568d87113aa?q=80&w=1964&auto=format&fit=crop', rating: 4.6, deliveryTime: '30-35 mins', cuisine: 'Burgers, American', type: 'non-veg', price: 159 },
    { name: 'Green Leaf Eatery', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1974&auto=format&fit=crop', rating: 4.8, deliveryTime: '20-25 mins', cuisine: 'Salads, Healthy', type: 'veg', price: 220 },
    { name: 'Subway', image: 'https://images.unsplash.com/photo-1528738432978-dc3781469625?q=80&w=1964&auto=format&fit=crop', rating: 4.5, deliveryTime: '25-30 mins', cuisine: 'Sandwiches, Salads', type: 'both', price: 250 },
    { name: 'Dosa Palace', image: 'https://images.unsplash.com/photo-1668438745582-788399184055?q=80&w=1974&auto=format&fit=crop', rating: 4.7, deliveryTime: '25-30 mins', cuisine: 'South Indian', type: 'veg', price: 180 },
    { name: 'Pizza Central', image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1974&auto=format&fit=crop', rating: 4.4, deliveryTime: '30-35 mins', cuisine: 'Pizza, Italian', type: 'both', price: 199 },
    { name: 'Kebabsville', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop', rating: 4.8, deliveryTime: '35-40 mins', cuisine: 'Kebab, North Indian', type: 'non-veg', price: 320 },
    { name: 'Pure Veggies', image: 'https://images.unsplash.com/photo-1627662388842-8d34b3f4db9a?q=80&w=1974&auto=format&fit=crop', rating: 4.9, deliveryTime: '20-25 mins', cuisine: 'North Indian, Thali', type: 'veg', price: 280 },
    { name: 'Smoky Grills', image: 'https://images.unsplash.com/photo-1626082933433-22b46a48f349?q=80&w=2070&auto=format&fit=crop', rating: 4.5, deliveryTime: '40-45 mins', cuisine: 'BBQ, Steak', type: 'non-veg', price: 450 },
];

// --- Filter Bar Component ---
const FilterBar = () => {
    const filters = ["Sort By", "Fast Delivery", "Ratings 4.0+", "Juice", "Snacks", "Offers", "Less than Rs. 300"];
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
const RestaurantCard = ({ restaurant }) => (
    <div className="bg-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out hover:scale-95 active:scale-90 group">
        <div className="relative">
            <img 
                src={restaurant.image} 
                alt={restaurant.name} 
                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" // reduced from h-48 to h-36
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x200/F3F4F6/9CA3AF?text=Image+Not+Found'; }}
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
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-amber-500 text-amber-500 font-bold rounded-lg hover:bg-amber-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-5 h-5"/>
                    ADD
                </button>
            </div>
        </div>
    </div>
);

// --- Main Restaurant Page Component ---
export default function App() {
    const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'non-veg'

    const filteredRestaurants = useMemo(() => {
        if (dietaryFilter === 'all') {
            return allRestaurants;
        }
        if (dietaryFilter === 'veg') {
            return allRestaurants.filter(r => r.type === 'veg' || r.type === 'both');
        }
        if (dietaryFilter === 'non-veg') {
            return allRestaurants.filter(r => r.type === 'non-veg' || r.type === 'both');
        }
    }, [dietaryFilter]);

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

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto mt-12">
                {/* --- Header Section --- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Restaurants in Manipal</h1>
                        <p className="text-gray-600 mt-1">Showing {filteredRestaurants.length} places</p>
                    </div>
                    <VegToggle filter={dietaryFilter} setFilter={setDietaryFilter} />
                </div>

                {/* --- Filter Bar --- */}
                <div className="mb-8">
                    <FilterBar />
                </div>

                {/* --- Restaurant Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                    {filteredRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.name} restaurant={restaurant} />
                    ))}
                </div>
            </div>
        </div>
    );
} 