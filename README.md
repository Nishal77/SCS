# Smart Canteen Management System (CMS)

A modern, full-stack web application for managing canteen operations with real-time inventory tracking, order management, and staff dashboard.

![CMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.0+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-38B2AC)


## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git**

## 🛠️ Installation

### Option 1: Docker Setup (Recommended)

#### Prerequisites
- **Docker** and **Docker Compose** installed
- Docker daemon running

#### Instant Setup
```bash
# Clone the repository
git clone https://github.com/Nishal77/SCS.git
cd SCS

# Gives permission to execute the setup file
chmod +x setup.sh

# Runs the setup script for instant deployment
./setup.sh
```

The application will be available at `http://localhost:3000`

### Option 2: Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Nishal77/SCS.git
cd SCS
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your Supabase credentials
nano .env
```

#### 4. Configure Environment Variables
Add your Supabase credentials to the `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 5. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Usage

### 1. Access the application in your browser:
```
# Docker deployment
http://localhost:3000

# Manual deployment
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

### Docker Commands
```bash
# Production build and run
docker-compose up -d

# Development mode with hot reload
docker-compose --profile dev up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

We welcome contributions from the community! There are many ways to support and improve the Smart Canteen Management System (CMS) — and writing code is just one of them. Whether it’s fixing bugs, improving documentation, designing UI/UX, suggesting new features, or sharing feedback — every contribution counts.

If you’d like to contribute code, follow these simple steps:

1. **Fork the repository.**
   [Fork the repository.](https://github.com/Nishal77/SCS/fork)

2. **Clone the fork to your local machine:**
   ```bash
   git clone https://github.com/<your username>/SCS.git
   cd SCS
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes and commit them**
   ```bash
   git commit -am 'feat: Add some feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Go to [the repository](https://github.com/Nishal77/SCS) and [make a Pull Request.](https://github.com/Nishal77/SCS/compare)**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for efficient canteen management**
