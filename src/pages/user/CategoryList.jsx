import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import supabase from '../../lib/supabase';

// --- Real Categories from Supabase ---
const useCategoriesData = () => {
    const [foodCategories, setFoodCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('inventory')
                    .select('category')
                    .order('category');
                
                if (error) throw error;
                
                // Get unique categories
                const uniqueCategories = [...new Set(data.map(item => item.category))];
                // Create category objects with default images
                const categoryObjects = uniqueCategories.map(category => ({
                    name: category,
                    image: `https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop`
                }));
                
                // If no categories found, add some default ones
                if (categoryObjects.length === 0) {
                    categoryObjects.push(
                        { name: 'Breakfast', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Lunch', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Dinner', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=200&auto=format&fit=crop' },
                        { name: 'Snacks', image: 'https://images.unsplash.com/photo-1625220194771-49bdda222896?q=80&w=200&auto=format&fit=crop' }
                    );
                }
                setFoodCategories(categoryObjects);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { foodCategories, loading, error };
};

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
    const { foodCategories, loading, error } = useCategoriesData();
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

    if (loading) {
        return (
            <div className="w-full mx-auto py-12 mb-12">
                <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600 text-sm">Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full mx-auto py-12 mb-12">
                <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                        <p className="text-red-600 text-sm">Error loading categories: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (foodCategories.length === 0) {
        return (
            <div className="w-full mx-auto py-12 mb-12">
                <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">No categories available.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-5">
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