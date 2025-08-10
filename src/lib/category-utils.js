// Category utility functions for consistent category image handling across components
import supabase from './supabase';

// Mapping of category names to specific Unsplash images
export const CATEGORY_IMAGES = {
    'Breakfast': 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=200&h=200&fit=crop&crop=center',
    'Indian main': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop&crop=center',
    'Chinese': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center',
    'Snacks': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center',
    'Combo meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&crop=center',
    'Beverages': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop&crop=center',
    'Fresh juices': 'https://images.unsplash.com/photo-1622597489932-894bae8cff0f?w=200&h=200&fit=crop&crop=center',
    'Milkshakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop&crop=center',
    'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&crop=center',
    'Dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&crop=center',
    'special_items': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&crop=center',
    'combo_pack': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&crop=center',
    'juice': 'https://images.unsplash.com/photo-1622597489932-894bae8cff0f?w=200&h=200&fit=crop&crop=center',
    'milk_shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop&crop=center',
    'icecreams': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center',
    'chat_items': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop&crop=center',
};

// Function to get category image with customizable dimensions
export const getCategoryImage = (categoryName, width = 200, height = 200) => {
    if (!categoryName) return null;
    
    // Check if we have a specific image for this category
    if (CATEGORY_IMAGES[categoryName]) {
        // Replace dimensions in the URL
        return CATEGORY_IMAGES[categoryName].replace(/w=\d+&h=\d+/, `w=${width}&h=${height}`);
    }
    
    // Fallback to random Unsplash image based on category name
    return `https://source.unsplash.com/${width}x${height}/?food,${encodeURIComponent(categoryName)}`;
};

// Function to get category image for small badges (32x32)
export const getCategoryBadgeImage = (categoryName) => {
    return getCategoryImage(categoryName, 32, 32);
};

// Function to get category image for filter buttons (24x24)
export const getCategoryFilterImage = (categoryName) => {
    return getCategoryImage(categoryName, 24, 24);
};

// Function to get category image for carousel (200x200)
export const getCategoryCarouselImage = (categoryName) => {
    return getCategoryImage(categoryName, 200, 200);
};

// Get all available categories
export const getAvailableCategories = () => {
    return Object.keys(CATEGORY_IMAGES);
};

// Check if a category has a specific image
export const hasCategoryImage = (categoryName) => {
    return categoryName in CATEGORY_IMAGES;
};

// Database-driven category functions
export const getCategoryFromDatabase = async (categoryName) => {
    try {
        // Prefer active category if column exists
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('name', categoryName)
            .eq('is_active', true)
            .maybeSingle();

        if (!error && data) return data;
    } catch (error) {
        // Fall through to unfiltered query
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('name', categoryName)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching category from database:', error);
        return null;
    }
};

export const getAllCategoriesFromDatabase = async () => {
    // Try active-only first (if column exists), otherwise return all
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true);
        if (!error && Array.isArray(data)) return data;
    } catch (error) {
        // ignore and fall back
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching categories from database:', error);
        return [];
    }
};

export const getCategoryImageWithFallback = async (categoryName, width = 200, height = 200) => {
    try {
        // First try to get from database
        const dbCategory = await getCategoryFromDatabase(categoryName);
        if (dbCategory && dbCategory.custom_image_url) {
            return dbCategory.custom_image_url;
        }
        if (dbCategory && dbCategory.image_url) {
            return dbCategory.image_url;
        }
    } catch (error) {
        console.error('Error getting category from database:', error);
    }

    // Fallback to static images
    return getCategoryImage(categoryName, width, height);
};
