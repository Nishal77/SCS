#!/bin/bash

# Smart Canteen Management System - Docker Setup Script
# This script provides instant setup for the CMS application using Docker

set -e

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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Docker daemon is running
check_docker_daemon() {
    print_status "Checking Docker daemon..."
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        print_status "Note: Your Docker Demon should be online"
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Check if .env file exists and validate environment variables
check_env_file() {
    print_status "Checking environment configuration..."
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_error "Please update .env file with your Supabase credentials before running the application:"
            echo ""
            echo "1. Open .env file: nano .env"
            echo "2. Replace the placeholder values with your actual Supabase credentials:"
            echo "   VITE_SUPABASE_URL=https://your-project-id.supabase.co"
            echo "   VITE_SUPABASE_ANON_KEY=your-anon-key-here"
            echo "3. Save the file and run this script again"
            echo ""
            exit 1
        else
            print_error "env.example file not found. Please create a .env file with your Supabase credentials:"
            echo "VITE_SUPABASE_URL=your_supabase_project_url"
            echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
            exit 1
        fi
    else
        print_success ".env file found"
        
        # Validate environment variables
        if ! grep -q "VITE_SUPABASE_URL=https://" .env || ! grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
            print_error "Invalid Supabase credentials in .env file!"
            echo ""
            echo "Please ensure your .env file contains:"
            echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co"
            echo "VITE_SUPABASE_ANON_KEY=your-anon-key-here"
            echo ""
            echo "Current .env content:"
            cat .env
            echo ""
            exit 1
        fi
        
        print_success "Supabase credentials are properly configured"
    fi
}

# Build and run the application
setup_application() {
    print_status "Building and starting the application..."
    
    # Build the Docker image
    print_status "Building Docker image..."
    docker-compose build
    
    # Start the application
    print_status "Starting the application..."
    docker-compose up -d
    
    print_success "Application is starting up..."
}

# Show application status
show_status() {
    print_status "Checking application status..."
    sleep 5
    
    if docker-compose ps | grep -q "Up"; then
        print_success "Application is running successfully!"
        echo ""
        echo -e "${GREEN}🎉 Smart Canteen Management System is now running!${NC}"
        echo ""
        echo -e "${BLUE}📱 Access your application at:${NC}"
        echo -e "   http://localhost:3000"
        echo ""
        echo -e "${BLUE}🔧 Useful commands:${NC}"
        echo -e "   View logs:     ${YELLOW}docker-compose logs -f${NC}"
        echo -e "   Stop app:      ${YELLOW}docker-compose down${NC}"
        echo -e "   Restart app:   ${YELLOW}docker-compose restart${NC}"
        echo -e "   Update app:    ${YELLOW}docker-compose pull && docker-compose up -d${NC}"
        echo ""
        echo -e "${BLUE}📊 Application Health:${NC}"
        echo -e "   Health check:  http://localhost:3000"
        echo ""
    else
        print_error "Application failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Development mode setup
setup_development() {
    print_status "Setting up development environment..."
    docker-compose --profile dev up -d
    print_success "Development environment is running at http://localhost:5173"
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Smart Canteen Management System - Docker Setup${NC}"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_daemon
    check_env_file
    
    # Ask user for mode
    echo ""
    echo -e "${YELLOW}Choose deployment mode:${NC}"
    echo "1) Production (recommended)"
    echo "2) Development (with hot reload)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            setup_application
            show_status
            ;;
        2)
            setup_development
            ;;
        *)
            print_error "Invalid choice. Using production mode."
            setup_application
            show_status
            ;;
    esac
}

# Run main function
main "$@" 