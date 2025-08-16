# 🍽️ Smart Canteen Management System

A comprehensive, production-ready canteen management system built with React, Tailwind CSS, and Supabase. Features real-time order tracking, secure payment processing, and a beautiful user interface.

## 🚀 **Features Overview**

### **User Dashboard**
- **Menu Browsing**: Browse categories and menu items with beautiful images
- **Cart Management**: Add/remove items, quantity management, real-time updates
- **Payment Processing**: Secure online payments with Razorpay integration
- **Order Tracking**: Real-time order status updates with progress indicators
- **Order History**: Complete order history with detailed information

### **Staff Dashboard**
- **Real-time Orders**: Live order updates with comprehensive details
- **Order Management**: Accept, reject, and update order statuses
- **Sales Analytics**: Real-time metrics, revenue tracking, and performance insights
- **Customer Management**: View customer details and order information

### **Admin Features**
- **Inventory Management**: Stock tracking and management
- **Category Management**: Organize menu items by categories
- **User Management**: Staff and user account management
- **Analytics Dashboard**: Comprehensive business insights

## 🏗️ **System Architecture**

### **Frontend (React + Tailwind CSS)**
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── user/          # User dashboard pages
│   ├── staff/         # Staff dashboard pages
│   └── auth/          # Authentication pages
├── lib/               # Utility functions and services
├── hooks/             # Custom React hooks
└── routes/            # Route definitions
```

### **Backend (Supabase)**
- **PostgreSQL Database**: Robust, scalable database
- **Real-time Subscriptions**: Live updates across all dashboards
- **Row Level Security**: Secure data access
- **Edge Functions**: Serverless backend logic
- **Storage**: Image and file management

## 📊 **Database Schema**

### **Core Tables**

#### **transactions**
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  subtotal_amount NUMERIC(10, 2) NOT NULL,
  service_fee NUMERIC(10, 2) DEFAULT 25.00,
  discount_amount NUMERIC(10, 2) DEFAULT 50.00,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_gateway TEXT,
  order_number TEXT UNIQUE NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'Pending',
  otp TEXT,
  token_number TEXT,
  dining_option TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **user_cart**
```sql
CREATE TABLE user_cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **inventory**
```sql
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 **Order Flow System**

### **1. Order Placement**
```
User adds items to cart → Proceeds to checkout → 
Selects payment method → Confirms payment → 
Order created in database → Redirected to orders page
```

### **2. Order Status Flow**
```
Pending → Accepted → Cooking → Ready → Delivered
   ↓         ↓         ↓        ↓        ↓
  New    Staff      Staff    Staff    Order
 Order  Accepts   Starts    Marks    Complete
         Order    Cooking   Ready
```

### **3. Real-time Updates**
- **WebSocket Subscriptions**: Instant updates across all dashboards
- **Status Synchronization**: Staff and user dashboards stay in sync
- **Notification System**: Real-time alerts for status changes

## 💳 **Payment Integration**

### **Razorpay Integration**
- **Test Mode**: Safe testing environment
- **Production Ready**: Easy switch to live payments
- **Secure Processing**: Encrypted payment data
- **Fallback System**: Offline payment simulation

### **Payment Methods**
- **Online Payment**: Credit/Debit cards, UPI, Net Banking
- **Cash Payment**: In-person payment handling
- **Card Payment**: Physical card transactions
- **UPI Payment**: Digital payment integration

## 🎨 **UI/UX Features**

### **Design System**
- **Modern Aesthetics**: Clean, professional interface
- **Responsive Design**: Works on all device sizes
- **Color Scheme**: Consistent brand colors
- **Typography**: Readable, accessible fonts
- **Icons**: Lucide React icon library

### **Interactive Elements**
- **Hover Effects**: Smooth transitions and animations
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation animations

## 🔐 **Security Features**

### **Authentication**
- **Session Management**: Secure user sessions
- **Protected Routes**: Route-level authentication
- **Role-based Access**: User and staff permissions
- **Secure Logout**: Proper session cleanup

### **Data Protection**
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Safe data rendering

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

### **Mobile-First Approach**
- **Touch-Friendly**: Optimized for mobile devices
- **Gesture Support**: Swipe and tap interactions
- **Performance**: Optimized for mobile networks
- **Accessibility**: Screen reader support

## 🚀 **Performance Optimization**

### **Frontend Optimization**
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed images and lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Local storage and service workers

### **Backend Optimization**
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Real-time Updates**: Efficient WebSocket handling
- **CDN Integration**: Fast content delivery

## 🧪 **Testing & Quality**

### **Code Quality**
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety (optional)
- **Error Boundaries**: Graceful error handling

### **Testing Strategy**
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: User workflow testing
- **Performance Tests**: Load and stress testing

## 📦 **Installation & Setup**

### **Prerequisites**
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Supabase account
```

### **Environment Setup**
```bash
# Clone repository
git clone <repository-url>
cd smart-canteen-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### **Supabase Setup**
1. **Create Project**: New Supabase project
2. **Database Setup**: Run migration scripts
3. **Authentication**: Configure auth settings
4. **Storage**: Set up image storage buckets
5. **RLS Policies**: Configure security policies

## 🔧 **Configuration**

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **Supabase Configuration**
```javascript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 📚 **API Documentation**

### **Core Functions**

#### **Cart Management**
```javascript
// Add item to cart
addToCart(productId, quantity, userId)

// Update cart item quantity
updateCartItemQuantity(itemId, newQuantity)

// Remove item from cart
removeFromCart(itemId)

// Get cart items
getCartItems(userId)
```

#### **Order Management**
```javascript
// Create transaction
createTransaction(orderData)

// Update order status
updateOrderStatus(orderId, newStatus)

// Get user orders
getUserOrders(userId)

// Get order details
getOrderDetails(orderId)
```

#### **Payment Processing**
```javascript
// Initialize payment
initializeRazorpayPayment(orderData, onSuccess, onFailure)

// Process payment
processPayment(paymentData)

// Verify payment
verifyPayment(paymentResponse)
```

## 🚀 **Deployment**

### **Frontend Deployment**
```bash
# Build production version
npm run build

# Deploy to Vercel/Netlify
vercel --prod
# or
netlify deploy --prod
```

### **Backend Deployment**
- **Supabase**: Automatic deployment
- **Database**: Managed PostgreSQL
- **Storage**: CDN-backed storage
- **Functions**: Serverless deployment

## 📊 **Monitoring & Analytics**

### **Performance Monitoring**
- **Core Web Vitals**: Page load performance
- **Error Tracking**: Real-time error monitoring
- **User Analytics**: User behavior tracking
- **Business Metrics**: Order and revenue analytics

### **Logging**
- **Application Logs**: User actions and system events
- **Error Logs**: Detailed error information
- **Performance Logs**: Response time tracking
- **Security Logs**: Authentication and access logs

## 🔄 **Updates & Maintenance**

### **Regular Updates**
- **Security Patches**: Monthly security updates
- **Feature Updates**: Quarterly feature releases
- **Bug Fixes**: Continuous bug resolution
- **Performance**: Ongoing optimization

### **Backup & Recovery**
- **Database Backups**: Daily automated backups
- **Code Versioning**: Git-based version control
- **Rollback Strategy**: Quick rollback procedures
- **Disaster Recovery**: Comprehensive recovery plan

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork Repository**: Create personal fork
2. **Feature Branch**: Create feature branch
3. **Development**: Implement features
4. **Testing**: Run tests and validation
5. **Pull Request**: Submit for review
6. **Code Review**: Peer review process
7. **Merge**: Merge approved changes

### **Code Standards**
- **ESLint**: Follow linting rules
- **Prettier**: Consistent formatting
- **Comments**: Clear code documentation
- **Tests**: Maintain test coverage

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Documentation**
- **User Guide**: Complete user documentation
- **API Reference**: Detailed API documentation
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

### **Contact**
- **Email**: support@smartcanteen.com
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Community**: Developer community forum

## 🎯 **Roadmap**

### **Phase 1 (Current)**
- ✅ Basic order management
- ✅ Payment integration
- ✅ Real-time updates
- ✅ User authentication

### **Phase 2 (Next)**
- 🔄 Advanced analytics
- 🔄 Inventory management
- 🔄 Staff scheduling
- 🔄 Customer feedback

### **Phase 3 (Future)**
- 📋 AI-powered recommendations
- 📋 Predictive analytics
- 📋 Mobile app development
- 📋 Multi-location support

---

**Built with ❤️ for modern canteen management**
