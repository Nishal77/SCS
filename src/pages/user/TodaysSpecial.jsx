import React, { useState, useRef } from 'react';
import { Star, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

// --- Mock Data ---
const foodItems = [
    { name: 'Burger King', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop', rating: 4.6, deliveryTime: '30-35 mins', cuisine: 'Burgers, American', price: 159, },
    { name: 'Subway', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=1964&auto=format&fit=crop', rating: 4.5, deliveryTime: '25-30 mins', cuisine: 'Salads, Sandwiches', price: 249, },
    { name: 'The Dosa Palace', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop', rating: 4.7, deliveryTime: '25-30 mins', cuisine: 'South Indian, Snacks', price: 120, },
    { name: 'Pizza Central', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop', rating: 4.4, deliveryTime: '30-35 mins', cuisine: 'Pizza, Italian, Fast Food', price: 199, },
    { name: 'Kebabsville', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1974&auto=format&fit=crop', rating: 4.8, deliveryTime: '35-40 mins', cuisine: 'Kebab, North Indian', price: 350, },
    { name: 'Biryani House', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop', rating: 4.9, deliveryTime: '25-30 mins', cuisine: 'Biryani, Hyderabadi', price: 299, },
];

// --- Food Item Card Component (Updated with smaller size) ---
const FoodItemCard = ({ item }) => (
    <div className="flex-shrink-0 w-72 bg-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out group ">
        <div className="relative">
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-36 object-cover transition-transform duration-300 "
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/288x176/F3F4F6/9CA3AF?text=Image+Not+Found'; }}
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
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-amber-500 text-amber-500 font-bold rounded-lg hover:bg-amber-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-5 h-5"/>
                    ADD
                </button>
            </div>
        </div>
    </div>
);

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
                <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
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
  return (
    <div className="font-sans">
      <div className="container mx-auto">
        <FoodCarousel title="Hot Picks of the Day">
            {foodItems.map((item) => (
                <FoodItemCard key={item.name} item={item} />
            ))}
        </FoodCarousel>
      </div>
    </div>
  );
};

export default TodaysSpecial; 