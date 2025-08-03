# Smart Canteen Management System (CMS)

A modern, full-stack web application for managing canteen operations with real-time inventory tracking, order management, and staff dashboard.

![CMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.0+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-38B2AC)

## 🚀 Features

### 📊 **Staff Dashboard**
- **Real-time Inventory Management**: Track products, stock levels, and pricing
- **Advanced Filtering System**: Filter by category, food type (veg/non-veg), and Today's Special
- **Bulk Operations**: Select and manage multiple products simultaneously
- **Today's Special Integration**: Mark and manage featured items directly from inventory
- **Live Statistics**: Real-time dashboard with product counts, stock levels, and revenue tracking
- **Professional Typography**: Custom local fonts (Newsreader, Open Sans, Roboto Flex, Josefin Sans)

### 🛒 **User Interface**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Real-time Updates**: Live data synchronization across all components
- **Image Management**: Product image upload and management system

### 🔧 **Technical Features**
- **Real-time Database**: Supabase integration with live data updates
- **Authentication System**: Secure user login and session management
- **Image Storage**: Cloud-based image storage with automatic optimization
- **Performance Optimized**: Fast loading times with efficient data fetching
- **Offline Capable**: Local font loading for better performance

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-canteen-system.git
cd smart-canteen-system/CMS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your Supabase credentials
nano .env
```

### 4. Configure Environment Variables
Add your Supabase credentials to the `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Database Setup
Run the database migrations to set up the required tables:
```bash
# Navigate to the supabase directory
cd supabase/migrations

# Apply migrations (if using Supabase CLI)
supabase db push
```

### 6. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔌 API Endpoints

### Authentication Endpoints
```javascript
// User Sign Up
supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// User Sign In
supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// User Sign Out
supabase.auth.signOut()

// Get Current User
supabase.auth.getUser()
```

### Inventory Management Endpoints
```javascript
// Fetch All Products
supabase
  .from('inventory')
  .select('*, profiles:added_by(id, name, email_name)')
  .order('created_at', { ascending: false })

// Add New Product
supabase
  .from('inventory')
  .insert({
    item_name: 'Product Name',
    description: 'Product Description',
    price: 100.00,
    category: 'Breakfast',
    food_type: 'veg',
    stock_constant: 50,
    stock_available: 50,
    min_to_cook: 10,
    image_url: 'image_url',
    is_todays_special: false,
    added_by: 'user_id'
  })
  .select()
  .single()

// Update Product
supabase
  .from('inventory')
  .update({
    item_name: 'Updated Name',
    price: 150.00,
    is_todays_special: true
  })
  .eq('id', 'product_id')
  .select()
  .single()

// Delete Product
supabase
  .from('inventory')
  .delete()
  .eq('id', 'product_id')

// Bulk Delete Products
supabase
  .from('inventory')
  .delete()
  .in('id', ['id1', 'id2', 'id3'])

// Toggle Today's Special Status
supabase
  .from('inventory')
  .update({ is_todays_special: true })
  .eq('id', 'product_id')
  .select()
  .single()

// Filter Products by Category
supabase
  .from('inventory')
  .select('*')
  .eq('category', 'Breakfast')

// Filter Products by Food Type
supabase
  .from('inventory')
  .select('*')
  .eq('food_type', 'veg')

// Filter Today's Special Items
supabase
  .from('inventory')
  .select('*')
  .eq('is_todays_special', true)
```

### User Profile Endpoints
```javascript
// Fetch User Profile
supabase
  .from('profiles')
  .select('*')
  .eq('id', 'user_id')
  .single()

// Update User Profile
supabase
  .from('profiles')
  .update({
    name: 'Updated Name',
    email_name: 'newemail@example.com'
  })
  .eq('id', 'user_id')
```

### Storage Endpoints
```javascript
// Upload Image
supabase.storage
  .from('product-images')
  .upload('filename.jpg', file)

// Get Image URL
supabase.storage
  .from('product-images')
  .getPublicUrl('filename.jpg')

// Delete Image
supabase.storage
  .from('product-images')
  .remove(['filename.jpg'])
```

### Real-time Subscriptions
```javascript
// Subscribe to Inventory Changes
supabase
  .channel('inventory_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'inventory' },
    (payload) => {
      console.log('Inventory changed:', payload)
    }
  )
  .subscribe()
```

## 🎯 Usage Guide

### Staff Dashboard

#### 1. **Inventory Management**
- **View Products**: See all products in a clean table format
- **Add Products**: Click "Add Product" to create new items
- **Edit Products**: Use the edit icon to modify existing products
- **Delete Products**: Remove products with the delete icon
- **Toggle Special Status**: Use the star icon to mark/unmark Today's Special items

#### 2. **Filtering System**
- **Menu All**: View all products
- **Category**: Filter by specific categories (Breakfast, Lunch, Dinner, etc.)
- **Vegetarian**: Show only vegetarian items
- **Non-Vegetarian**: Show only non-vegetarian items
- **Today's Special**: View only featured items

#### 3. **Bulk Operations**
- Select multiple products using checkboxes
- Perform bulk delete operations
- Manage multiple items simultaneously

#### 4. **Real-time Statistics**
- Total Products count
- Total Inventory Value
- In Stock items
- Low Stock alerts
- Out of Stock items
- Vegetarian/Non-vegetarian counts
- Today's Special count

### User Interface

#### 1. **Product Browsing**
- Browse products by category
- View Today's Special items
- See product details and pricing

#### 2. **Order Management**
- Add items to cart
- Place orders
- Track order status

## 🎨 Customization

### Fonts
The system uses local fonts for better performance:
- **Newsreader**: Used for headings (elegant, readable)
- **Open Sans**: Used for body text (clean, professional)
- **Roboto Flex**: Used for UI elements (modern interface)
- **Josefin Sans**: Used for navigation (elegant appearance)

### Styling
- Built with Tailwind CSS for consistent design
- Responsive design for all screen sizes
- Custom color schemes and branding support

## 🔧 Development

### Project Structure
```
CMS/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/
│   │   ├── staff/          # Staff dashboard pages
│   │   └── user/           # User interface pages
│   ├── lib/                # Utility functions and configurations
│   ├── hooks/              # Custom React hooks
│   └── assets/
│       └── fonts/          # Local font files
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 🔒 Security

- **Authentication**: Secure user authentication with Supabase Auth
- **Data Validation**: Input validation on all forms
- **SQL Injection Protection**: Parameterized queries with Supabase
- **XSS Protection**: React's built-in XSS protection
- **CORS Configuration**: Proper CORS setup for API calls

## 📊 Performance

- **Image Optimization**: Automatic image compression and optimization
- **Lazy Loading**: Images and components load on demand
- **Caching**: Efficient caching strategies
- **Bundle Optimization**: Code splitting and tree shaking
- **Local Fonts**: No external font dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete inventory management system
- ✅ Real-time filtering and search
- ✅ Today's Special integration
- ✅ Professional typography system
- ✅ Responsive design
- ✅ User and staff dashboards
- ✅ Image management
- ✅ Bulk operations
- ✅ Real-time statistics

---

**Built with ❤️ for efficient canteen management**
