import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// --- Mock Data ---
// Expanded list of food categories for a better scrolling experience.
const foodCategories = [
    { name: 'Idli', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Idli' },
    { name: 'Vada', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Vada' },
    { name: 'Dosa', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Dosa' },
    { name: 'Chole Bhature', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Chole+Bhature' },
    { name: 'Poori', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Poori' },
    { name: 'Cakes', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Cakes' },
    { name: 'Biryani', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Biryani' },
    { name: 'Pizza', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Pizza' },
    { name: 'Rolls', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Rolls' },
    { name: 'Thali', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Thali' },
    { name: 'Noodles', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Noodles' },
    { name: 'Shakes', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Shakes' },
    { name: 'Pasta', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Pasta' },
    { name: 'Juice', image: 'https://placehold.co/150x150/FFF5F2/F97316?text=Juice' },
];

// --- Food Category Card Component (Updated for smaller size) ---
const FoodCategoryCard = ({ category }) => (
    <a href="#" className="flex-shrink-0 w-28 text-center group">
        <div className="relative">
            <img 
                src={category.image} 
                alt={category.name} 
                className="w-24 h-24 object-cover rounded-full mx-auto transition-transform duration-300 ease-in-out group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/F3F4F6/9CA3AF?text=Error'; }}
            />
        </div>
        <p className="mt-2 text-base font-medium text-gray-700 truncate">{category.name}</p>
    </a>
);

// --- Draggable Carousel Component (Updated with refined styling) ---
const FoodCategoriesCarousel = () => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Arrow button scroll functionality
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Drag-to-scroll mouse event handlers
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
        const walk = (x - startX) * 2; // The multiplier makes the scroll faster
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };


    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-gray-800">What's on your mind?</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => scroll('left')} 
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        aria-label="Scroll left"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        aria-label="Scroll right"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide cursor-grab"
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeaveOrUp}
                onMouseUp={onMouseLeaveOrUp}
                onMouseMove={onMouseMove}
            >
                {foodCategories.map((category) => (
                    <FoodCategoryCard key={category.name} category={category} />
                ))}
            </div>
        </div>
    );
};

export default FoodCategoriesCarousel; 