// Simple utility functions for image handling and common operations

// Generate random rating between 3.8 and 4.9
export const generateRandomRating = () => {
    return Math.round((Math.random() * (4.9 - 3.8) + 3.8) * 10) / 10;
};

// Format image URLs from various sources (Unsplash, Pixabay, direct URLs)
export const formatImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') {
        return '';
    }
    
    // If it's an Unsplash photo URL, convert it to proper image URL
    if (imageUrl.includes('unsplash.com/photos/')) {
        // For Unsplash URLs, we need to use a different approach
        // The slug format has changed, so we'll use a fallback approach
        // Try to extract a valid photo ID or use a default food image
        
        // First, try to extract the photo ID from the slug
        const photoId = imageUrl.split('/photos/')[1];
        
        // If the photo ID looks like a valid Unsplash ID (alphanumeric, 11 chars)
        if (photoId && /^[a-zA-Z0-9]{11}$/.test(photoId)) {
            return `https://images.unsplash.com/photo-${photoId}?q=80&w=400&h=400&fit=crop`;
        }
        
        // If it's a descriptive slug, try to extract the ID from the end
        const actualPhotoId = photoId.split('-').pop();
        if (actualPhotoId && /^[a-zA-Z0-9]{11}$/.test(actualPhotoId)) {
            return `https://images.unsplash.com/photo-${actualPhotoId}?q=80&w=400&h=400&fit=crop`;
        }
        
        // If we can't extract a valid ID, use a default food image
        console.log(`⚠️ Could not extract valid Unsplash photo ID from: ${imageUrl}`);
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
    }
    
    // If it's a Pixabay photo URL, convert it to proper image URL
    if (imageUrl.includes('pixabay.com/photos/')) {
        // Extract the photo ID from Pixabay URL
        // Format: https://pixabay.com/photos/biryani-indian-food-meal-dish-8563961/
        const photoId = imageUrl.split('-').pop().replace('/', '');
        
        if (photoId && /^\d+$/.test(photoId)) {
            // Pixabay direct image URL format
            return `https://cdn.pixabay.com/photo/2023/01/01/00/00/biryani-${photoId}_1280.jpg`;
        }
        
        // If we can't extract a valid ID, use a default food image
        console.log(`⚠️ Could not extract valid Pixabay photo ID from: ${imageUrl}`);
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
    }
    
    // If it's already a proper image URL, return as is
    if (imageUrl.startsWith('http') && (
        imageUrl.includes('.jpg') || 
        imageUrl.includes('.png') || 
        imageUrl.includes('.jpeg') || 
        imageUrl.includes('images.unsplash.com') ||
        imageUrl.includes('cdn.pixabay.com') ||
        imageUrl.includes('images.pexels.com')
    )) {
        return imageUrl;
    }
    
    // If it's a Supabase storage URL, return as is
    if (imageUrl.includes('supabase.co/storage/') || 
        imageUrl.includes('supabase.co/') || 
        imageUrl.includes('storage.googleapis.com') ||
        imageUrl.includes('product-menu')) {
        return imageUrl;
    }
    
    return imageUrl;
};

// Format product data for user display
export const formatProductForUser = (product) => {
    // Ensure price is properly formatted as a number
    let formattedPrice = 0;
    if (product.price !== null && product.price !== undefined) {
        formattedPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
        // If parsing fails, set to 0
        if (isNaN(formattedPrice)) {
            formattedPrice = 0;
        }
        // Ensure price is always positive
        if (formattedPrice < 0) {
            formattedPrice = 0;
        }
    }
    
    return {
        id: product.id,
        name: product.item_name,
        description: product.description,
        price: formattedPrice,
        category: product.category,
        image: formatImageUrl(product.image_url),
        deliveryTime: `${product.min_to_cook} mins`,
        rating: generateRandomRating(),
        cuisine: product.category,
        stockAvailable: product.stock_available || 0,
        stockConstant: product.stock_constant || 0,
        addedBy: product.profiles?.name || product.profiles?.email_name || 'Staff',
        createdAt: product.created_at,
        isSpecial: product.is_todays_special === true
    };
};

// Check if product is available
export const isProductAvailable = (product) => {
    const stock = product.stock_available || product.stockAvailable || 0;
    return stock > 0;
};

// Check stock level and return status
export const getStockStatus = (stockAvailable) => {
    if (!stockAvailable || stockAvailable <= 0) {
        return {
            status: 'out_of_stock',
            label: 'Out of Stock',
            color: 'red',
            canOrder: false
        };
    } else if (stockAvailable <= 5) {
        return {
            status: 'low_stock',
            label: `Only ${stockAvailable} left`,
            color: 'yellow',
            canOrder: true
        };
    } else {
        return {
            status: 'in_stock',
            label: 'In Stock',
            color: 'green',
            canOrder: true
        };
    }
};

// Format price for consistent display across the application
export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return '0.00';
    }
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    if (isNaN(numPrice) || numPrice < 0) {
        return '0.00';
    }
    
    // Format to 2 decimal places
    return numPrice.toFixed(2);
};

// Format price with currency symbol for display
export const formatPriceWithCurrency = (price) => {
    const formattedPrice = formatPrice(price);
    return `₹${formattedPrice}`;
}; 