#!/bin/bash

# ========================================
# Smart Canteen Order System Setup Script
# ========================================

echo "🚀 Starting Smart Canteen Order System Setup..."
echo "=============================================="

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

# Check if we're in the right directory
check_directory() {
    print_status "Checking current directory..."
    if [ -f "package.json" ] && [ -d "supabase" ]; then
        print_success "Found project files in current directory"
        return 0
    else
        print_error "Please run this script from the project root directory"
        print_status "Make sure you have package.json and supabase/ directory"
        return 1
    fi
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        print_warning "No .env file found, creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env from template"
            print_warning "Please edit .env file with your Supabase credentials"
        else
            print_error "No env.example file found"
            return 1
        fi
    else
        print_success ".env file already exists"
    fi
    
    return 0
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Setup Supabase
setup_supabase() {
    print_status "Setting up Supabase..."
    
    if [ ! -d "supabase/.temp" ]; then
        print_status "Initializing Supabase project..."
        supabase init
    fi
    
    print_status "Starting Supabase local development..."
    supabase start
    
    if [ $? -eq 0 ]; then
        print_success "Supabase started successfully"
        return 0
    else
        print_error "Failed to start Supabase"
        return 1
    fi
}

# Apply migrations
apply_migrations() {
    print_status "Applying database migrations..."
    
    supabase db reset
    
    if [ $? -eq 0 ]; then
        print_success "Migrations applied successfully"
        return 0
    else
        print_error "Failed to apply migrations"
        return 1
    fi
}

# Setup sample data
setup_sample_data() {
    print_status "Setting up sample data..."
    
    # This will be done through the web interface
    print_status "Sample data setup will be available through the web interface"
    print_status "Use the 'Add Sample Data' button in the staff dashboard"
    
    return 0
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    print_success "Setup complete! Starting development server..."
    echo ""
    echo "🌐 Your Smart Canteen System is now running!"
    echo "=============================================="
    echo "📱 User Dashboard: http://localhost:5173"
    echo "👨‍💼 Staff Dashboard: http://localhost:5173/staff"
    echo "🔧 Supabase Dashboard: http://localhost:54323"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open the staff dashboard in your browser"
    echo "2. Click '🏗️ Create Tables' to set up the database"
    echo "3. Click '📝 Add Sample Data' to add sample orders"
    echo "4. Click '🔄 Refresh Orders' to see the orders with items"
    echo ""
    echo "💡 If you encounter any issues:"
    echo "   - Check the browser console for error messages"
    echo "   - Use the debug buttons in the staff dashboard"
    echo "   - Ensure Supabase is running: supabase status"
    echo ""
    
    npm run dev
}

# Main setup function
main() {
    echo ""
    print_status "Starting Smart Canteen Order System setup..."
    echo ""
    
    # Check prerequisites
    if ! check_directory; then
        exit 1
    fi
    
    if ! check_supabase_cli; then
        exit 1
    fi
    
    # Setup steps
    if ! setup_env; then
        exit 1
    fi
    
    if ! install_dependencies; then
        exit 1
    fi
    
    if ! setup_supabase; then
        exit 1
    fi
    
    if ! apply_migrations; then
        exit 1
    fi
    
    if ! setup_sample_data; then
        exit 1
    fi
    
    # Start the development server
    start_dev_server
}

# Run main function
main "$@"
