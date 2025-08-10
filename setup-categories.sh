#!/bin/bash

# Category Management Setup Script
# This script helps set up the category management system for the Smart Canteen System

echo "🚀 Setting up Category Management System..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CMS project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Warning: Supabase CLI not found"
    echo "   Please install Supabase CLI: https://supabase.com/docs/guides/cli"
    echo "   Or run the migrations manually in your Supabase dashboard"
else
    echo "✅ Supabase CLI found"
    
    # Check if we're in a Supabase project
    if [ -d ".supabase" ]; then
        echo "✅ Supabase project detected"
        
        echo "📊 Running database migrations..."
        supabase db push
        
        if [ $? -eq 0 ]; then
            echo "✅ Database migrations completed successfully"
        else
            echo "❌ Database migrations failed"
            echo "   Please check your Supabase connection and try again"
        fi
    else
        echo "⚠️  No .supabase directory found"
        echo "   Please run 'supabase init' first or run migrations manually"
    fi
fi

echo ""
echo "🔧 Manual Setup Steps (if needed):"
echo "=================================="
echo "1. Create the categories table in your Supabase database:"
echo "   - Run the SQL from: supabase/migrations/20250728154623_create_categories_table.sql"
echo ""
echo "2. Set up the storage bucket for category images:"
echo "   - Run the SQL from: supabase/migrations/20250728154624_create_category_images_bucket.sql"
echo ""
echo "3. Configure storage policies in your Supabase dashboard:"
echo "   - Go to Storage > Policies"
echo "   - Ensure the 'category-images' bucket has proper access controls"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo "1. Start your development server: npm run dev"
echo "2. Navigate to the staff dashboard"
echo "3. Go to Menu Management > Categories"
echo "4. Start creating and managing your food categories!"
echo ""

echo "📚 Documentation:"
echo "================"
echo "• Category Management README: CATEGORY_MANAGEMENT_README.md"
echo "• Category Images README: CATEGORY_IMAGES_README.md"
echo "• Supabase Setup: SUPABASE_SETUP.md"
echo ""

echo "🎉 Setup complete! Happy category managing!"
