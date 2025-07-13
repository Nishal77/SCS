import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// --- Data with Verified High-Quality Images ---
const foodCategories = [
    { name: 'Idli', image: 'https://images.unsplash.com/photo-1596889921594-a8c4aa069d24?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Vada', image: 'https://images.unsplash.com/photo-1643282333213-a40091c8d5a1?q=80&w=1964&auto=format&fit=crop' },
    { name: 'Dosa', image: 'https://images.unsplash.com/photo-1668665632120-d3a3f5b08076?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Chole Bhature', image: 'https://plus.unsplash.com/premium_photo-1695863433321-f81d13f9f3f9?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Poori', image: 'https://plus.unsplash.com/premium_photo-1695863433154-7223901b8e4c?q=80&w=1968&auto=format&fit=crop' },
    { name: 'Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop' },
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop' },
    { name: 'Pizza', image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1928&auto=format&fit=crop' },
    { name: 'Rolls', image: 'https://images.unsplash.com/photo-1625220194771-49bdda222896?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Thali', image: 'https://images.unsplash.com/photo-1565557623262-b27e252489a9?q=80&w=1965&auto=format&fit=crop' },
    { name: 'Noodles', image: 'https://images.unsplash.com/photo-1612927601601-66384216b3c6?q=80&w=1887&auto=format&fit=crop' },
    { name: 'Shakes', image: 'https://images.unsplash.com/photo-1624827294958-3933c2a1353c?q=80&w=1887&auto=format&fit=crop' },
];

// --- Food Category Card Component ---
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

// --- Draggable Carousel Component ---
const FoodCategoriesCarousel = () => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
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
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="w-full mx-auto py-12 mb-12">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold text-gray-800">Explore the Menu</h2>
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
                // This 'scrollbar-hide' class now works because of the CSS you added!
                className="flex space-x-4 pl-4 pb-4 overflow-x-auto scrollbar-hide cursor-grab"
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