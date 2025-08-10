# Category Images Feature

This feature adds beautiful, high-quality Unsplash images for all food categories across the Smart Canteen System.

## Overview

The category images feature provides:
- **Consistent visual identity** for each food category
- **High-quality Unsplash images** that are relevant to each category
- **Multiple image sizes** optimized for different UI components
- **Centralized management** through utility functions
- **Fallback support** for new categories

## Features

### 🖼️ Pre-defined Category Images
Each category has a carefully selected Unsplash image:

- **Breakfast** - Delicious breakfast spread
- **Indian main** - Traditional Indian cuisine
- **Chinese** - Authentic Chinese dishes
- **Snacks** - Appetizing snack items
- **Combo meals** - Complete meal combinations
- **Beverages** - Refreshing drinks
- **Fresh juices** - Natural fruit juices
- **Milkshakes** - Creamy milkshakes
- **Lunch** - Lunch time favorites
- **Dinner** - Evening meal selections

### 📱 Multiple Image Sizes
The system provides optimized images for different use cases:

- **Badge Size (32x32)** - For category badges in tables
- **Filter Size (24x24)** - For filter buttons and dropdowns
- **Carousel Size (200x200)** - For category carousels and cards
- **Custom Sizes** - Any dimensions you need

## Implementation

### 1. Utility Functions

All category image functionality is centralized in `src/lib/category-utils.js`:

```javascript
import { 
    getCategoryImage, 
    getCategoryBadgeImage, 
    getCategoryFilterImage, 
    getCategoryCarouselImage 
} from '@/lib/category-utils';

// Get image with custom dimensions
const image = getCategoryImage('Breakfast', 150, 100);

// Get pre-sized images
const badgeImage = getCategoryBadgeImage('Breakfast');        // 32x32
const filterImage = getCategoryFilterImage('Breakfast');      // 24x24
const carouselImage = getCategoryCarouselImage('Breakfast');  // 200x200
```

### 2. Components Updated

The following components now display category images:

#### Staff Inventory (`src/pages/staff/product/inventory.jsx`)
- **CategoryBadge**: Shows category image + text badge
- **FilterOptions**: Displays selected category image
- **Category dropdown**: Enhanced with visual indicators

#### User CategoryList (`src/pages/user/CategoryList.jsx`)
- **FoodCategoryCard**: Large category images in carousel
- **Category carousel**: Beautiful visual browsing experience

#### User RestaurantList (`src/pages/user/RestaurantList.jsx`)
- **FilterBar**: Category images in filter buttons
- **Enhanced filtering**: Visual category identification

### 3. Image Sources

All images are sourced from Unsplash with specific photo IDs for consistency:

```javascript
export const CATEGORY_IMAGES = {
    'Breakfast': 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=200&h=200&fit=crop&crop=center',
    'Indian main': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop&crop=center',
    // ... more categories
};
```

## Usage Examples

### Basic Category Image
```javascript
import { getCategoryImage } from '@/lib/category-utils';

const CategoryComponent = ({ categoryName }) => (
    <img 
        src={getCategoryImage(categoryName)} 
        alt={categoryName}
        className="w-full h-32 object-cover rounded-lg"
    />
);
```

### Category Badge with Image
```javascript
import { getCategoryBadgeImage } from '@/lib/category-utils';

const CategoryBadge = ({ category }) => (
    <div className="flex items-center gap-2">
        <img 
            src={getCategoryBadgeImage(category)} 
            alt={category}
            className="w-6 h-6 rounded-full object-cover"
        />
        <span className="px-3 py-1 rounded-full text-xs font-semibold">
            {category}
        </span>
    </div>
);
```

### Filter Button with Category Image
```javascript
import { getCategoryFilterImage } from '@/lib/category-utils';

const FilterButton = ({ category, label }) => (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg">
        <img 
            src={getCategoryFilterImage(category)} 
            alt={label}
            className="w-4 h-4 rounded-full object-cover"
        />
        <span>{label}</span>
    </button>
);
```

## Benefits

### 🎨 Visual Enhancement
- **Professional appearance** with high-quality food photography
- **Consistent branding** across all category displays
- **Better user experience** with visual category recognition

### 🔧 Developer Experience
- **Centralized management** - all images in one place
- **Easy to maintain** - update images without touching components
- **Type-safe functions** - clear API for different use cases
- **Fallback support** - automatic handling of new categories

### 📱 Responsive Design
- **Optimized sizes** for different screen densities
- **Fast loading** with appropriately sized images
- **Accessibility** with proper alt text and semantic markup

## Adding New Categories

To add a new category with an image:

1. **Add to utility file**:
```javascript
// In src/lib/category-utils.js
export const CATEGORY_IMAGES = {
    // ... existing categories
    'New Category': 'https://images.unsplash.com/photo-XXXXX?w=200&h=200&fit=crop&crop=center',
};
```

2. **Use in components**:
```javascript
const newCategoryImage = getCategoryImage('New Category');
```

3. **Automatic fallback** for categories without specific images:
```javascript
// Falls back to random Unsplash image
const fallbackImage = getCategoryImage('Unknown Category');
```

## Demo Component

A demo component is available at `src/components/CategoryImageDemo.jsx` that showcases:
- All available category images
- Different image sizes
- Utility function usage
- Implementation examples

## Performance Considerations

- **Image optimization**: All images use Unsplash's built-in resizing
- **Lazy loading**: Images load only when needed
- **Caching**: Browser caching for repeated image requests
- **Fallback handling**: Graceful degradation for missing images

## Browser Support

- **Modern browsers**: Full support for all features
- **Image formats**: WebP and JPEG support where available
- **Responsive images**: Automatic sizing based on device capabilities
- **Accessibility**: Screen reader friendly with proper alt text

## Future Enhancements

Potential improvements for the future:
- **Local image storage** for offline support
- **Image compression** for faster loading
- **Multiple image variants** for different themes
- **User-uploaded category images** for customization
- **Image lazy loading** with intersection observer
- **Progressive image loading** for better UX

## Troubleshooting

### Common Issues

1. **Images not loading**:
   - Check network connectivity
   - Verify category names match exactly
   - Ensure utility functions are imported correctly

2. **Wrong image sizes**:
   - Use appropriate utility functions for your use case
   - Check that dimensions are passed correctly

3. **Performance issues**:
   - Use appropriate image sizes for your component
   - Consider lazy loading for large lists

### Debug Mode

Enable debug logging by checking the browser console for:
- Category image requests
- Fallback image usage
- Utility function calls

## Contributing

When adding new categories or modifying existing ones:
1. **Choose high-quality images** that represent the category well
2. **Maintain consistent aspect ratios** for visual harmony
3. **Update documentation** to reflect changes
4. **Test across different components** to ensure consistency

---

This feature enhances the visual appeal and user experience of the Smart Canteen System while maintaining excellent performance and developer experience.
