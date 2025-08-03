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

## ⚙️ Usage

### 1. Access the application in your browser:
```
http://localhost:5173
```

### 2. Login using the provided credentials (for staff access):
- **Email**: `staff@canteen.com`
- **Password**: `staff123`

### 3. Explore the Staff Dashboard:
- **Inventory Management**: Add, edit, delete, and manage products
- **Today's Special**: Toggle star icon to mark items as featured
- **Filtering**: Use filter buttons (Menu All, Category, Vegetarian, Non-Vegetarian, Today's Special)
- **Bulk Operations**: Select multiple products and perform bulk actions
- **Real-time Stats**: View live statistics on dashboard cards

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

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for efficient canteen management**
