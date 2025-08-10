import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import supabase from '../../lib/supabase';
import { getCategoryCarouselImage, getAllCategoriesFromDatabase } from '../../lib/category-utils';

// --- Real Categories from Supabase ---
const useCategoriesData = () => {
    const [foodCategories, setFoodCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                
                // First try to get categories from the categories table
                let categoryObjects = [];
                try {
                    const dbCategories = await getAllCategoriesFromDatabase();
                    if (dbCategories && dbCategories.length > 0) {
                        categoryObjects = dbCategories.map(category => ({
                            name: category.name,
                            image: category.custom_image_url || category.image_url || getCategoryCarouselImage(category.name),
                            description: category.description,
                            color_scheme: category.color_scheme
                        }));
                    }
                } catch (dbError) {
                    console.log('Categories table not available, falling back to inventory table');
                }

                // Fallback to inventory table if categories table is empty or unavailable
                if (categoryObjects.length === 0) {
                    const { data, error } = await supabase
                        .from('inventory')
                        .select('category')
                        .order('category');
                    
                    if (error) throw error;
                    
                    // Get unique categories
                    const uniqueCategories = [...new Set(data.map(item => item.category))];
                    // Create category objects with Unsplash images
                    categoryObjects = uniqueCategories.map(category => ({
                        name: category,
                        image: getCategoryCarouselImage(category)
                    }));
                }
                
                // If still no categories found, add some default ones with Unsplash images
                if (categoryObjects.length === 0) {
                    categoryObjects.push(
                        { name: 'Breakfast', image: getCategoryCarouselImage('Breakfast') },
                        { name: 'Lunch', image: getCategoryCarouselImage('Lunch') },
                        { name: 'Dinner', image: getCategoryCarouselImage('Dinner') },
                        { name: 'Snacks', image: getCategoryCarouselImage('Snacks') }
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
            {/* Section Header with Navigation */}
            <div className="flex justify-between items-center mb-8">
                {/* Left side - Text */}
                <div className="text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore the Menu</h2>
                    <p className="text-gray-600">Browse by categories to find your favorite dishes</p>
                </div>
                
                {/* Right side - Navigation Controls */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => scroll('left')}
                        className="bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm hover:shadow-md"
                        aria-label="Scroll left"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm hover:shadow-md"
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