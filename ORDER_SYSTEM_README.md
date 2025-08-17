# 🍽️ Smart Canteen Order System - Complete Guide

## 📋 Overview

The Smart Canteen Order System is a comprehensive solution for managing canteen orders, payments, and staff operations. This system includes:

- **User Dashboard**: Browse menu, add items to cart, place orders
- **Staff Dashboard**: Manage orders, track status, view analytics
- **Payment Integration**: Online and cash payment support
- **Real-time Updates**: Live order tracking and notifications
- **Inventory Management**: Stock tracking and management

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CMS
   ```

2. **Run the setup script**
   ```bash
   ./setup-order-system.sh
   ```

   This script will:
   - Install dependencies
   - Set up Supabase
   - Apply database migrations
   - Start the development server

3. **Access the system**
   - User Dashboard: http://localhost:5173
   - Staff Dashboard: http://localhost:5173/staff
   - Supabase Dashboard: http://localhost:54323

## 🏗️ Database Structure

### Core Tables

#### `transactions` Table
Stores order and payment information:
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- user_email: TEXT
- user_name: TEXT
- user_phone: TEXT
- total_amount: NUMERIC(10,2)
- payment_method: TEXT
- payment_status: TEXT
- order_number: TEXT (Unique)
- order_status: TEXT
- items: JSONB (Order items array)
- otp: TEXT
- token_number: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `order_items` Table
Detailed tracking of individual items in each order:
```sql
- id: UUID (Primary Key)
- transaction_id: UUID (References transactions)
- item_name: TEXT
- quantity: INTEGER
- price: DECIMAL(10,2)
- image_url: TEXT
- category: TEXT
- special_instructions: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_cart` Table
User shopping cart management:
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- product_id: UUID (References inventory)
- quantity: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `inventory` Table
Product catalog and stock management:
```sql
- id: UUID (Primary Key)
- item_name: TEXT
- description: TEXT
- price: DECIMAL(10,2)
- image_url: TEXT
- category: TEXT
- stock_available: INTEGER
- stock_constant: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔄 Order Flow

### 1. User Experience
1. **Browse Menu**: Users view available items in the inventory
2. **Add to Cart**: Items are added to user_cart table
3. **Review Cart**: Cart contents are displayed with totals
4. **Place Order**: Order is created in transactions table
5. **Payment**: Payment is processed (online/cash)
6. **Confirmation**: OTP and token are generated

### 2. Staff Experience
1. **Order Notification**: Real-time order updates
2. **Order Management**: Accept, reject, or update order status
3. **Status Tracking**: Monitor order progress (Pending → Accepted → Cooking → Ready → Delivered)
4. **Analytics**: View sales data and performance metrics

## 🛠️ Setup and Configuration

### Environment Variables

Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Migrations

The system includes several migrations:
- `20250115000000_create_comprehensive_order_system.sql` - Base order system
- `20250115000001_create_simple_transactions.sql` - Transactions table
- `20250115000002_add_items_to_transactions.sql` - Items support
- `20250728154619_add_stock_fields_to_inventory.sql` - Stock management
- `20250728154622_create_user_cart_table.sql` - Cart functionality

### Running Migrations

```bash
# Apply all migrations
supabase db reset

# Apply specific migration
supabase migration up 20250115000002_add_items_to_transactions
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Items not loaded" Error
**Problem**: Order items are not displaying in the staff dashboard

**Solutions**:
1. **Check Database Structure**:
   ```bash
   # Click "🔍 Inspect DB" button in staff dashboard
   # Verify items column exists in transactions table
   ```

2. **Create Missing Tables**:
   ```bash
   # Click "🏗️ Create Tables" button
   # This will create order_items table if missing
   ```

3. **Add Sample Data**:
   ```bash
   # Click "📝 Add Sample Data" button
   # This will populate tables with test data
   ```

4. **Check Migration Status**:
   ```bash
   supabase migration list
   supabase db reset
   ```

#### 2. Real-time Updates Not Working
**Problem**: Orders don't update in real-time

**Solutions**:
1. **Check Supabase Connection**:
   ```bash
   supabase status
   ```

2. **Verify Environment Variables**:
   - Check `.env` file
   - Ensure Supabase URL and keys are correct

3. **Check Browser Console**:
   - Look for connection errors
   - Verify real-time subscription status

#### 3. Payment Processing Issues
**Problem**: Orders are not being created after payment

**Solutions**:
1. **Check Transaction Creation**:
   - Verify `createTransaction` function is working
   - Check browser console for errors

2. **Verify Cart Items**:
   - Ensure cart contains items before payment
   - Check cart data structure

3. **Database Permissions**:
   - Verify RLS policies are correct
   - Check if user has permission to create transactions

### Debug Tools

The staff dashboard includes several debug buttons:

- **🔍 Inspect DB**: Check database schema and structure
- **🏗️ Create Tables**: Create missing database tables
- **📝 Add Sample Data**: Populate tables with test data
- **🔄 Refresh Orders**: Manually refresh order data
- **🧪 Test Real-time**: Test real-time functionality
- **🔍 Test Items**: Verify item fetching logic

## 📊 Data Flow

### Order Creation Process
```
User Cart → Payment → Transaction Creation → Order Items Storage → Real-time Update
    ↓              ↓              ↓              ↓              ↓
user_cart    PaymentService   transactions   order_items   Staff Dashboard
```

### Item Storage Priority
1. **Primary**: `transactions.items` (JSONB column)
2. **Secondary**: `order_items` table (detailed tracking)
3. **Fallback**: localStorage (development/testing)

## 🎯 Best Practices

### 1. Database Design
- Use JSONB for flexible item storage
- Maintain referential integrity with foreign keys
- Implement proper indexing for performance
- Use RLS policies for security

### 2. Error Handling
- Implement comprehensive error logging
- Provide user-friendly error messages
- Use fallback mechanisms for critical operations
- Validate data at multiple levels

### 3. Performance
- Use real-time subscriptions sparingly
- Implement proper caching strategies
- Optimize database queries
- Monitor query performance

### 4. Security
- Validate all user inputs
- Implement proper authentication
- Use RLS policies for data access control
- Sanitize data before database operations

## 🔮 Future Enhancements

### Planned Features
- **Advanced Analytics**: Sales forecasting, trend analysis
- **Inventory Alerts**: Low stock notifications
- **Customer Management**: Loyalty programs, preferences
- **Multi-location Support**: Multiple canteen locations
- **Mobile App**: Native mobile applications
- **Integration APIs**: Third-party service integrations

### Technical Improvements
- **Microservices Architecture**: Break down into smaller services
- **Event Sourcing**: Better audit trail and data consistency
- **Caching Layer**: Redis integration for performance
- **Message Queues**: Asynchronous order processing
- **Monitoring**: Application performance monitoring

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support
- Check the browser console for error messages
- Use the debug tools in the staff dashboard
- Review the migration files for database structure
- Check Supabase logs for backend issues

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎉 Conclusion

The Smart Canteen Order System provides a robust foundation for managing canteen operations. With proper setup and configuration, it offers:

- **Reliable Order Management**: Complete order lifecycle tracking
- **Real-time Updates**: Live order status updates
- **Comprehensive Analytics**: Sales and performance insights
- **Scalable Architecture**: Easy to extend and modify
- **Developer Friendly**: Comprehensive debugging tools

For additional support or questions, please refer to the troubleshooting section or use the debug tools provided in the staff dashboard.
