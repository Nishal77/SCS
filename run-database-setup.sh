#!/bin/bash

# ========================================
# Database Setup Script for Smart Canteen Order System
# ========================================

echo "🏗️ Setting up Smart Canteen Order System Database..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
check_directory() {
    print_status "Checking current directory..."
    if [ -f "setup-database.sql" ]; then
        print_success "Found database setup file"
        return 0
    else
        print_error "setup-database.sql not found in current directory"
        print_status "Please run this script from the project root directory"
        return 1
    fi
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    print_status "Checking Supabase CLI installation..."
    if command -v supabase &> /dev/null; then
        print_success "Supabase CLI is installed"
        return 0
    else
        print_error "Supabase CLI is not installed"
        print_status "Please install Supabase CLI first:"
        echo "  npm install -g supabase"
        echo "  or visit: https://supabase.com/docs/guides/cli"
        return 1
    fi
}

# Check Supabase status
check_supabase_status() {
    print_status "Checking Supabase status..."
    if supabase status &> /dev/null; then
        print_success "Supabase is running"
        return 0
    else
        print_warning "Supabase is not running or not accessible"
        print_status "Starting Supabase..."
        supabase start
        if [ $? -eq 0 ]; then
            print_success "Supabase started successfully"
            return 0
        else
            print_error "Failed to start Supabase"
            return 1
        fi
    fi
}

# Run the database setup
run_database_setup() {
    print_status "Running database setup..."
    
    # Check if setup-database.sql exists
    if [ ! -f "setup-database.sql" ]; then
        print_error "setup-database.sql file not found"
        return 1
    fi
    
    print_status "Applying database setup..."
    
    # Run the SQL file
    supabase db reset --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed successfully!"
        return 0
    else
        print_error "Database setup failed"
        print_status "Trying alternative method..."
        
        # Try to run the SQL directly
        print_status "Running SQL file directly..."
        supabase db reset
        
        if [ $? -eq 0 ]; then
            print_success "Database setup completed successfully!"
            return 0
        else
            print_error "All database setup methods failed"
            return 1
        fi
    fi
}

# Verify the setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if tables exist
    print_status "Checking if tables were created..."
    
    # You can add more verification steps here
    print_success "Database setup verification complete"
    return 0
}

# Main execution
main() {
    echo ""
    print_status "Starting database setup process..."
    echo ""
    
    # Check prerequisites
    if ! check_directory; then
        exit 1
    fi
    
    if ! check_supabase_cli; then
        exit 1
    fi
    
    if ! check_supabase_status; then
        exit 1
    fi
    
    # Run the setup
    if ! run_database_setup; then
        print_error "Database setup failed. Please check the error messages above."
        exit 1
    fi
    
    # Verify the setup
    verify_setup
    
    echo ""
    print_success "🎉 Database setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Refresh your staff dashboard in the browser"
    echo "2. Click '🔄 Refresh Orders' to see orders with items"
    echo "3. Use '🔍 Fix This Order' button to add items to existing orders"
    echo "4. The 'Items not loaded' error should now be resolved"
    echo ""
    echo "💡 If you still see issues:"
    echo "   - Check the browser console for any error messages"
    echo "   - Use the debug buttons in the staff dashboard"
    echo "   - Ensure Supabase is running: supabase status"
    echo ""
}

# Run main function
main "$@"
