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
- **Professional Typography**: Custom local fonts for optimal performance

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

### 5. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔌 API Endpoints

### Authentication
```javascript
// User Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// User Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// User Sign Out
const { error } = await supabase.auth.signOut()
```

### Inventory Management
```javascript
// Get All Products
const { data, error } = await supabase
  .from('inventory')
  .select('*')
  .order('created_at', { ascending: false })

// Add New Product
const { data, error } = await supabase
  .from('inventory')
  .insert({
    item_name: 'Product Name',
    price: 100.00,
    category: 'Breakfast',
    food_type: 'veg',
    stock_constant: 50,
    stock_available: 50,
    is_todays_special: false
  })

// Update Product
const { data, error } = await supabase
  .from('inventory')
  .update({ price: 150.00 })
  .eq('id', 'product_id')

// Delete Product
const { error } = await supabase
  .from('inventory')
  .delete()
  .eq('id', 'product_id')

// Filter Products
const { data, error } = await supabase
  .from('inventory')
  .select('*')
  .eq('food_type', 'veg') // or 'category', 'Breakfast'
```

### File Storage
```javascript
// Upload Image
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('filename.jpg', file)

// Get Image URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl('filename.jpg')
```

## 🎯 Usage Guide

### Staff Dashboard

#### **Inventory Management**
- View all products in a clean table format
- Add new products with detailed information
- Edit existing products using the edit icon
- Delete products with confirmation
- Toggle Today's Special status with star icon

#### **Filtering System**
- **Menu All**: View all products
- **Category**: Filter by specific categories
- **Vegetarian**: Show only vegetarian items
- **Non-Vegetarian**: Show only non-vegetarian items
- **Today's Special**: View only featured items

#### **Bulk Operations**
- Select multiple products using checkboxes
- Perform bulk delete operations
- Manage multiple items simultaneously

#### **Real-time Statistics**
- Total Products count
- Total Inventory Value
- In Stock items
- Low Stock alerts
- Out of Stock items
- Vegetarian/Non-vegetarian counts
- Today's Special count

## 🎨 Customization

The system uses local fonts for better performance and includes:
- Professional typography system
- Responsive design for all screen sizes
- Custom color schemes and branding support
- Built with Tailwind CSS for consistent design

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Netlify
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 🔒 Security & Performance

- **Authentication**: Secure user authentication with Supabase Auth
- **Data Validation**: Input validation on all forms
- **SQL Injection Protection**: Parameterized queries with Supabase
- **XSS Protection**: React's built-in XSS protection
- **Image Optimization**: Automatic compression and optimization
- **Lazy Loading**: Images and components load on demand
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
