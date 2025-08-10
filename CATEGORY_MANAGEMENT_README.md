# Category Management Feature

This feature provides a comprehensive system for managing food categories in the Smart Canteen System, including custom image uploads, color schemes, and database-driven category management.

## Overview

The Category Management feature allows staff to:
- **Create and manage food categories** with custom names and descriptions
- **Upload custom images** for each category to replace default Unsplash images
- **Set color schemes** for consistent UI styling across the application
- **Control category visibility** with active/inactive status
- **Organize categories** with custom sort orders
- **Manage category metadata** including descriptions and styling

## Features

### 🎨 Custom Category Images
- **Image Upload**: Staff can upload custom images for each category
- **Multiple Formats**: Supports JPEG, PNG, WebP, and GIF formats
- **Image Preview**: Real-time preview of uploaded images
- **Fallback System**: Automatically falls back to Unsplash images if no custom image is set
- **Storage Management**: Images stored in Supabase storage with proper access controls

### 🎯 Category Management
- **CRUD Operations**: Create, Read, Update, and Delete categories
- **Active Status**: Toggle categories on/off without deleting them
- **Sort Order**: Customize the display order of categories
- **Search & Filter**: Find categories quickly with search functionality
- **Bulk Operations**: Manage multiple categories efficiently

### 🎨 Visual Customization
- **Color Schemes**: Pre-defined color themes for consistent branding
- **Responsive Design**: Beautiful card-based layout that works on all devices
- **Visual Feedback**: Clear indicators for active/inactive categories
- **Professional UI**: Modern, intuitive interface following design best practices

## Database Schema

### Categories Table
```sql
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    custom_image_url TEXT,
    color_scheme VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket
- **Bucket Name**: `category-images`
- **File Size Limit**: 5MB
- **Supported Formats**: JPEG, PNG, WebP, GIF
- **Access Control**: Public read, authenticated upload/update/delete

## Implementation

### 1. Staff Interface

The category management interface is located at:
```
src/pages/staff/product/category-management.jsx
```

**Key Components:**
- **CategoryCard**: Displays category information with image and actions
- **CategoryModal**: Form for adding/editing categories
- **CategoryManagement**: Main component with search, sort, and grid layout

**Features:**
- Drag-and-drop image upload
- Real-time image preview
- Color scheme selection
- Active/inactive toggle
- Sort order management

### 2. Navigation Integration

Categories are accessible through the staff sidebar:
```
Menu Management > Categories
```

The navigation automatically highlights the current page and provides easy access to category management.

### 3. Database Integration

**Utility Functions** (`src/lib/category-utils.js`):
```javascript
// Get category from database
export const getCategoryFromDatabase = async (categoryName);

// Get all active categories
export const getAllCategoriesFromDatabase = async ();

// Get image with database fallback
export const getCategoryImageWithFallback = async (categoryName, width, height);
```

**Fallback System:**
1. Check database for custom image
2. Check database for default image
3. Fall back to static Unsplash image
4. Use random Unsplash image as last resort

### 4. User Interface Integration

Categories automatically appear in:
- **CategoryList**: User-facing category carousel
- **RestaurantList**: Category filters
- **Inventory**: Staff category management

## Usage

### For Staff

#### Adding a New Category
1. Navigate to **Menu Management > Categories**
2. Click **"Add Category"** button
3. Fill in category details:
   - **Name**: Category name (required)
   - **Description**: Optional description
   - **Color Scheme**: Choose from pre-defined themes
   - **Sort Order**: Numeric order for display
   - **Image**: Upload custom image or use default
   - **Active Status**: Enable/disable category
4. Click **"Create Category"**

#### Editing a Category
1. Click the **Edit** button on any category card
2. Modify the desired fields
3. Upload a new image if needed
4. Click **"Update Category"**

#### Managing Category Status
- **Active**: Category is visible to users
- **Inactive**: Category is hidden but preserved
- Toggle with the eye icon on each category card

### For Users

Categories automatically appear in the user interface with:
- **Custom images** (if uploaded by staff)
- **Fallback images** (Unsplash photos)
- **Consistent styling** based on color schemes
- **Proper ordering** as set by staff

## Color Schemes

Pre-defined color themes for consistent branding:

| Theme | Classes | Preview |
|-------|---------|---------|
| Blue | `bg-blue-100 text-blue-700 border-blue-200` | 🔵 Blue Theme |
| Green | `bg-green-100 text-green-700 border-green-200` | 🟢 Green Theme |
| Red | `bg-red-100 text-red-700 border-red-200` | 🔴 Red Theme |
| Yellow | `bg-yellow-100 text-yellow-700 border-yellow-200` | 🟡 Yellow Theme |
| Orange | `bg-orange-100 text-orange-700 border-orange-200` | 🟠 Orange Theme |
| Purple | `bg-purple-100 text-purple-700 border-purple-200` | 🟣 Purple Theme |
| Cyan | `bg-cyan-100 text-cyan-700 border-cyan-200` | 🔷 Cyan Theme |
| Pink | `bg-pink-100 text-pink-700 border-pink-200` | 💗 Pink Theme |
| Indigo | `bg-indigo-100 text-indigo-700 border-indigo-200` | 🔷 Indigo Theme |
| Gray | `bg-gray-100 text-gray-700 border-gray-200` | ⚫ Gray Theme |

## File Structure

```
src/
├── pages/
│   ├── staff/
│   │   ├── product/
│   │   │   ├── category-management.jsx    # Main category management
│   │   │   └── inventory.jsx              # Updated with category integration
│   │   └── components/
│   │       └── sidebar.jsx                # Updated navigation
│   └── user/
│       └── CategoryList.jsx               # Updated to use database categories
├── lib/
│   └── category-utils.js                  # Enhanced with database functions
└── supabase/
    └── migrations/
        ├── 20250728154623_create_categories_table.sql
        └── 20250728154624_create_category_images_bucket.sql
```

## Database Migrations

### 1. Categories Table
- Creates the main categories table
- Inserts default categories with color schemes
- Sets up proper indexing and RLS policies
- Adds automatic timestamp updates

### 2. Storage Bucket
- Creates `category-images` storage bucket
- Sets up proper access controls
- Configures file size and format limits
- Enables public read access for images

## Security Features

### Row Level Security (RLS)
- **Categories table**: Authenticated users only
- **Storage bucket**: Public read, authenticated write
- **Automatic cleanup**: Proper deletion policies

### Access Control
- **Staff only**: Category management restricted to authenticated staff
- **Public images**: Category images visible to all users
- **Secure uploads**: File validation and size limits

## Performance Considerations

### Image Optimization
- **Automatic resizing**: Supabase handles image optimization
- **Format support**: Modern image formats for better compression
- **Lazy loading**: Images load only when needed
- **Caching**: Browser and CDN caching for fast access

### Database Performance
- **Indexed queries**: Fast category lookups
- **Efficient joins**: Optimized database relationships
- **Connection pooling**: Reusable database connections

## Error Handling

### Graceful Degradation
- **Database errors**: Fall back to static categories
- **Image errors**: Use default Unsplash images
- **Network issues**: Continue with cached data
- **Missing data**: Provide helpful error messages

### User Feedback
- **Loading states**: Clear indication of progress
- **Error messages**: Helpful error descriptions
- **Success confirmations**: Confirmation of actions
- **Validation feedback**: Real-time form validation

## Future Enhancements

### Planned Features
- **Bulk category operations**: Import/export categories
- **Category templates**: Pre-defined category sets
- **Advanced image editing**: Crop, filter, and adjust images
- **Category analytics**: Usage statistics and insights
- **Multi-language support**: Internationalized category names

### Technical Improvements
- **Image compression**: Automatic image optimization
- **CDN integration**: Global image delivery
- **Real-time updates**: Live category synchronization
- **Advanced search**: Full-text search and filtering
- **API endpoints**: RESTful category management API

## Troubleshooting

### Common Issues

#### Categories Not Loading
1. Check database connection
2. Verify RLS policies are correct
3. Ensure categories table exists
4. Check for JavaScript errors in console

#### Image Upload Failures
1. Verify storage bucket exists
2. Check file size limits (5MB)
3. Ensure file format is supported
4. Verify authentication status

#### Navigation Issues
1. Check sidebar component updates
2. Verify route configuration
3. Ensure proper page state management
4. Check for JavaScript errors

### Debug Mode

Enable debug logging by checking the browser console for:
- Database query results
- Image upload progress
- Category fetch operations
- Error messages and stack traces

## Contributing

When contributing to the category management feature:

1. **Follow existing patterns**: Maintain consistency with current code
2. **Test thoroughly**: Ensure all CRUD operations work correctly
3. **Update documentation**: Keep README and comments current
4. **Consider performance**: Optimize database queries and image handling
5. **Maintain security**: Follow security best practices

## Support

For issues or questions about the category management feature:

1. **Check documentation**: Review this README and related files
2. **Review console logs**: Look for error messages and warnings
3. **Test database**: Verify database connectivity and permissions
4. **Check storage**: Ensure storage bucket is properly configured
5. **Review code**: Examine component logic and error handling

---

This feature provides a robust, user-friendly system for managing food categories with professional-grade image management and consistent visual styling across the Smart Canteen System.
