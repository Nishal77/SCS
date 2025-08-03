#!/bin/bash

# Environment Setup Helper Script for Smart Canteen Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo -e "${BLUE}🔧 Supabase Environment Setup${NC}"
echo "=================================="
echo ""

print_status "This script will help you set up your Supabase environment variables."
echo ""

# Check if .env file exists
if [ -f .env ]; then
    print_warning ".env file already exists!"
    echo ""
    echo "Current .env content:"
    cat .env
    echo ""
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
        print_status "Setup cancelled. Your existing .env file is preserved."
        exit 0
    fi
fi

echo ""
print_status "To get your Supabase credentials:"
echo "1. Go to https://supabase.com and sign in"
echo "2. Create a new project or select an existing one"
echo "3. Go to Settings > API"
echo "4. Copy the 'Project URL' and 'anon public' key"
echo ""

# Get Supabase URL
read -p "Enter your Supabase Project URL (e.g., https://your-project.supabase.co): " supabase_url

# Validate URL format
if [[ ! $supabase_url =~ ^https://.*\.supabase\.co$ ]]; then
    print_error "Invalid Supabase URL format! It should be like: https://your-project.supabase.co"
    exit 1
fi

# Get Supabase Anon Key
read -p "Enter your Supabase Anon Key: " supabase_anon_key

# Validate key format (basic check)
if [[ ${#supabase_anon_key} -lt 50 ]]; then
    print_error "Invalid Supabase Anon Key! It should be a long string."
    exit 1
fi

# Create .env file
echo "# Supabase Configuration" > .env
echo "VITE_SUPABASE_URL=$supabase_url" >> .env
echo "VITE_SUPABASE_ANON_KEY=$supabase_anon_key" >> .env

print_success "Environment variables have been set up!"
echo ""
echo "Your .env file contains:"
echo "VITE_SUPABASE_URL=$supabase_url"
echo "VITE_SUPABASE_ANON_KEY=${supabase_anon_key:0:20}..."
echo ""

print_status "You can now run the Docker setup:"
echo "chmod +x setup.sh"
echo "./setup.sh"
echo ""

print_success "Setup complete! 🎉" 