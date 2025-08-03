// This component is a web-based implementation using React and Tailwind CSS.
// It creates a comprehensive inventory management system for staff to manage all product data.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState, useEffect, useCallback } from 'react';
// Icons for the UI
import { 
    Plus, Download, Settings2, SlidersHorizontal, ArrowUpDown, Table, BarChart2,
    Trash2, Edit, X, TrendingUp, Clock, User, CreditCard, CheckCircle, 
    XCircle, AlertCircle, Package, Phone, MapPin, Calendar, DollarSign, Search,
    Filter, Upload, Eye, EyeOff, Tag, Image as ImageIcon
} from 'lucide-react';
import { formatImageUrl, formatProductForUser } from '@/lib/image-utils';
import supabase from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';


// --- Reusable Components ---

// Header Component
const Header = () => (
    <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all canteen products, prices, and availability</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
                <button className="p-2 rounded-full hover:bg-gray-100"><Download size={20} /></button>
                <button className="p-2 rounded-full hover:bg-gray-100"><Settings2 size={20} /></button>
                <div className="flex -space-x-2">
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=S" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 1"/>
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=C" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 2"/>
                </div>
            </div>
            <button className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
                <Settings2 size={16} />
                <span>Settings</span>
            </button>
        </div>
    </header>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex-1 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={14} />
                        <span>{change}</span>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Icon size={24} className="text-gray-600" />
            </div>
        </div>
    </div>
);

// Status Badge Component - Shows stock information
const StatusBadge = ({ stockAvailable, stockConstant }) => {
    const available = stockAvailable || 0;
    const constant = stockConstant || 0;
    
    let status, statusStyles;
    
    if (available === 0) {
        status = 'Out of Stock';
        statusStyles = 'bg-red-100 text-red-700 border-red-200';
    } else if (available < constant * 0.2) {
        status = 'Low Stock';
        statusStyles = 'bg-orange-100 text-orange-700 border-orange-200';
    } else {
        status = 'In Stock';
        statusStyles = 'bg-green-100 text-green-700 border-green-200';
    }
    
    return (
        <div className="flex flex-col gap-1">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles}`}>
                {status}
            </span>
            <span className="text-xs text-gray-500">
                {available} of {constant}
            </span>
        </div>
    );
};

// Category Badge Component
const CategoryBadge = ({ category }) => {
    const categoryStyles = {
        'Breakfast': 'bg-blue-100 text-blue-700 border-blue-200',
        'Lunch': 'bg-green-100 text-green-700 border-green-200',
        'Dinner': 'bg-purple-100 text-purple-700 border-purple-200',
        'Snacks': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Beverages': 'bg-pink-100 text-pink-700 border-pink-200',
        'Desserts': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryStyles[category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {category}
        </span>
    );
};



// Product Image Component
const ProductImage = ({ image, name, onEdit }) => {
    // Format the image URL for display
    const formatImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl.trim() === '') {
            return '';
        }
        
        // If it's an Unsplash photo URL, convert it to proper image URL
        if (imageUrl.includes('unsplash.com/photos/')) {
            // For Unsplash URLs, we need to use a different approach
            // The slug format has changed, so we'll use a fallback approach
            // Try to extract a valid photo ID or use a default food image
            
            // First, try to extract the photo ID from the slug
            const photoId = imageUrl.split('/photos/')[1];
            
            // If the photo ID looks like a valid Unsplash ID (alphanumeric, 11 chars)
            if (photoId && /^[a-zA-Z0-9]{11}$/.test(photoId)) {
                return `https://images.unsplash.com/photo-${photoId}?q=80&w=400&h=400&fit=crop`;
            }
            
            // If it's a descriptive slug, try to extract the ID from the end
            const actualPhotoId = photoId.split('-').pop();
            if (actualPhotoId && /^[a-zA-Z0-9]{11}$/.test(actualPhotoId)) {
                return `https://images.unsplash.com/photo-${actualPhotoId}?q=80&w=400&h=400&fit=crop`;
            }
            
            // If we can't extract a valid ID, use a default food image
            console.log(`⚠️ Could not extract valid Unsplash photo ID from: ${imageUrl}`);
            return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
        }
        
        // If it's a Pixabay photo URL, convert it to proper image URL
        if (imageUrl.includes('pixabay.com/photos/')) {
            // Extract the photo ID from Pixabay URL
            // Format: https://pixabay.com/photos/biryani-indian-food-meal-dish-8563961/
            const photoId = imageUrl.split('-').pop().replace('/', '');
            
            if (photoId && /^\d+$/.test(photoId)) {
                // Pixabay direct image URL format
                return `https://cdn.pixabay.com/photo/2023/01/01/00/00/biryani-${photoId}_1280.jpg`;
            }
            
            // If we can't extract a valid ID, use a default food image
            console.log(`⚠️ Could not extract valid Pixabay photo ID from: ${imageUrl}`);
            return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
        }
        
        // If it's already a proper image URL, return as is
        if (imageUrl.startsWith('http') && (
            imageUrl.includes('.jpg') || 
            imageUrl.includes('.png') || 
            imageUrl.includes('.jpeg') || 
            imageUrl.includes('images.unsplash.com') ||
            imageUrl.includes('cdn.pixabay.com') ||
            imageUrl.includes('images.pexels.com')
        )) {
            return imageUrl;
        }
        
        // If it's a Supabase storage URL, return as is
        if (imageUrl.includes('supabase.co/storage/')) {
            return imageUrl;
        }
        
        return imageUrl;
    };
    
    const formattedImageUrl = formatImageUrl(image);
    
    // Only show image if it exists, no default fallback
    if (!formattedImageUrl || formattedImageUrl.trim() === '') {
        return (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <ImageIcon size={24} className="text-gray-400" />
            </div>
        );
    }
    
    return (
        <div className="relative group">
            <img 
                src={formattedImageUrl} 
                alt={name || 'Product'}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onError={(e) => { 
                    console.log(`❌ Image failed to load for ${name}:`, formattedImageUrl);
                    // Try to load a fallback image
                    if (!e.target.dataset.fallbackAttempted) {
                        e.target.dataset.fallbackAttempted = 'true';
                        e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&h=400&fit=crop';
                    } else {
                        // If fallback also fails, show placeholder
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }
                }}
                onLoad={(e) => {
                    console.log(`✅ Image loaded successfully for ${name}:`, formattedImageUrl);
                }}
            />
            {/* Fallback placeholder - hidden by default */}
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 hidden">
                <ImageIcon size={24} className="text-gray-400" />
            </div>
            <button 
                onClick={onEdit}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
            >
                <ImageIcon size={16} className="text-white" />
            </button>
        </div>
    );
};

// Filter Options Component
const FilterOptions = ({ onFilter, activeFilter, onCategorySelect, selectedCategory }) => {
    const filters = [
        { id: 'all', label: 'Menu All', icon: '🍽️' },
        { id: 'category', label: 'Category', icon: '📂' },
        { id: 'special', label: "Today's Special", icon: '⭐' }
    ];

    const categories = ['All Categories', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];

    const handleFilterClick = (filterId) => {
        onFilter(filterId);
    };

    const handleCategoryChange = (e) => {
        onCategorySelect(e.target.value);
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-6">
            <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterClick(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                activeFilter === filter.id
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            <span className="text-lg">{filter.icon}</span>
                            <span className="font-medium">{filter.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Category dropdown - only show when category filter is active */}
                {activeFilter === 'category' && (
                    <div className="flex gap-3 items-center">
                        <span className="text-sm font-medium text-gray-700">Filter by:</span>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

// Add/Edit Product Modal Component
const ProductModal = ({ isOpen, onClose, product, onSave, mode }) => {
    const [formData, setFormData] = useState({
        name: product?.item_name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || 'Snacks',
        image: product?.image_url || '',
        deliveryTime: product?.min_to_cook || '',
        stockConstant: product?.stock_constant || '',
        stockAvailable: product?.stock_available || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // All fields required including image
        if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.deliveryTime || !formData.stockConstant || !formData.image) {
            alert('All fields are required including product image.');
            return;
        }
        onSave(formData);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {mode === 'add' ? 'Add New Product' : 'Edit Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Desserts">Desserts</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (min)</label>
                            <input
                                type="number"
                                name="deliveryTime"
                                value={formData.deliveryTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stockConstant"
                                value={formData.stockConstant}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                min="0"
                                placeholder="Total stock available"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Stock</label>
                            <input
                                type="number"
                                name="stockAvailable"
                                value={formData.stockAvailable}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                                min="0"
                                placeholder="Currently available"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <ImageUpload
                                onImageUpload={(imageUrl) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        image: imageUrl
                                    }));
                                }}
                                currentImageUrl={formData.image}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Product description..."
                            required
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            {mode === 'add' ? 'Add Product' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Inventory Table Component ---
const InventoryTable = ({ onStatsUpdate }) => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProduct, setEditingProduct] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    // Fetch inventory from Supabase - defined with useCallback to avoid recreation
    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select(`
                    *,
                    profiles:added_by(
                        id,
                        name,
                        email_name
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setProducts(data || []);
            
            // Calculate stats
            const inventoryStats = {
                total: data?.length || 0,
                inStock: data?.filter(item => item.stock_available > 0).length || 0,
                lowStock: data?.filter(item => item.stock_available <= 10 && item.stock_available > 0).length || 0,
                outOfStock: data?.filter(item => item.stock_available === 0).length || 0
            };
            
            if (onStatsUpdate) {
                onStatsUpdate(inventoryStats);
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [onStatsUpdate]);

    // Initial data fetch
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    const handleFilter = (filterType) => {
        setActiveFilter(filterType);
        applyFilters(filterType, selectedCategory);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        applyFilters(activeFilter, category);
    };

    const applyFilters = (filterType, category) => {
        let filtered = products;
        
        switch (filterType) {
            case 'category':
                // Filter by specific category if selected
                if (category && category !== 'All Categories') {
                    filtered = products.filter(product => product.category === category);
                } else {
                    // Show all products grouped by category
                    filtered = products.sort((a, b) => a.category.localeCompare(b.category));
                }
                break;
            case 'special':
                // Show today's special (products with higher stock or recent additions)
                filtered = products.filter(product => 
                    (product.stock_available > 0) || 
                    (new Date(product.created_at).toDateString() === new Date().toDateString())
                );
                break;
            case 'all':
            default:
                // Show all products
                filtered = products;
                break;
        }
        
        setFilteredProducts(filtered);
    };

    const toggleProduct = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(productId => productId !== id) : [...prev, id]
        );
    };

    const handleAddProduct = () => {
        setModalMode('add');
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const { error } = await supabase
                    .from('inventory')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                setProducts(prev => prev.filter(product => product.id !== id));
                setSelectedProducts(prev => prev.filter(productId => productId !== id));
                
                // Refresh data
                fetchInventory();
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete product');
            }
        }
    };

    const handleSaveProduct = async (formData) => {
        try {
            console.log('Saving product with form data:', formData);
            
            // Get current user session for added_by
            const userSession = localStorage.getItem('user_session');
            const sessionData = userSession ? JSON.parse(userSession) : null;
            const addedBy = sessionData?.id || null;
            
            console.log('User session data:', sessionData);
            console.log('Added by user ID:', addedBy);

            if (modalMode === 'add') {
                // Add new product
                const { data: newProduct, error } = await supabase
                    .from('inventory')
                    .insert({
                        item_name: formData.name,
                        description: formData.description || '',
                        price: parseFloat(formData.price),
                        category: formData.category,
                        image_url: formData.image || '',
                        min_to_cook: parseInt(formData.min_to_cook) || 0,
                        stock_constant: parseInt(formData.stock_constant) || 0,
                        stock_available: parseInt(formData.stock_available) || 0,
                        added_by: addedBy
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                setProducts(prev => [newProduct, ...prev]);
                console.log('Product added successfully:', newProduct);
            } else if (editingProduct) {
                // Update existing product
                const { data: updatedProduct, error } = await supabase
                    .from('inventory')
                    .update({
                        item_name: formData.name,
                        description: formData.description || '',
                        price: parseFloat(formData.price),
                        category: formData.category,
                        image_url: formData.image || '',
                        min_to_cook: parseInt(formData.min_to_cook) || 0,
                        stock_constant: parseInt(formData.stock_constant) || 0,
                        stock_available: parseInt(formData.stock_available) || 0
                    })
                    .eq('id', editingProduct.id)
                    .select()
                    .single();
                
                if (error) throw error;
                setProducts(prev => prev.map(product => product.id === editingProduct.id ? updatedProduct : product));
                console.log('Product updated successfully:', updatedProduct);
            }
            
            // Close modal
            setIsModalOpen(false);
            setEditingProduct(null);
            
            // Refresh data
            fetchInventory();
        } catch (err) {
            console.error('Save error:', err);
            const errorMessage = err.message || 'Failed to save product';
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            try {
                const { error } = await supabase
                    .from('inventory')
                    .delete()
                    .in('id', selectedProducts);
                
                if (error) throw error;
                setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
                setSelectedProducts([]);
                
                // Refresh data
                fetchInventory();
            } catch (err) {
                console.error('Bulk delete error:', err);
                alert('Failed to delete products');
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            {/* Filter Options */}
            <FilterOptions 
                onFilter={handleFilter} 
                activeFilter={activeFilter}
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
            />
            
            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle size={20} />
                        <span className="font-semibold">Error</span>
                    </div>
                    <p className="text-red-700 mt-2">{error}</p>
                    {error.includes('Supabase is not configured') && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-blue-800 text-sm">
                                <strong>Quick Fix:</strong> Copy <code>env.example</code> to <code>.env</code> and add your Supabase credentials.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Table Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100">
                        <Table size={16} /> Table View
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold">
                        <SlidersHorizontal size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 font-semibold">
                        <ArrowUpDown size={16} /> Sort
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Download size={16} /> Export
                    </button>
                    <button 
                        onClick={handleAddProduct}
                        className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="p-3 font-medium w-10">
                                <input 
                                    type="checkbox" 
                                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedProducts(filteredProducts.map(p => p.id));
                                        } else {
                                            setSelectedProducts([]);
                                        }
                                    }}
                                />
                            </th>
                            <th className="p-3 font-medium">Product</th>
                            <th className="p-3 font-medium">Category</th>
                            <th className="p-3 font-medium">Price</th>
                            <th className="p-3 font-medium">Stock</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleProduct(product.id)}
                                    />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <ProductImage 
                                            image={product.image_url} 
                                            name={product.item_name}
                                            onEdit={() => handleEditProduct(product)}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">{product.item_name}</p>
                                            <p className="text-xs text-gray-500">{product.description || 'No description'}</p>
                                            <p className="text-xs text-gray-400">{product.min_to_cook || 0} mins</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <CategoryBadge category={product.category} />
                                </td>
                                <td className="p-3">
                                    <p className="font-bold text-gray-800">₹{product.price}</p>
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-medium text-gray-600">{product.stock_available || 0}</p>
                                        <p className="text-xs text-gray-500">of {product.stock_constant || 0}</p>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <StatusBadge stockAvailable={product.stock_available} stockConstant={product.stock_constant} />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleEditProduct(product)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            {selectedProducts.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between shadow-inner">
                    <p className="font-semibold text-gray-700">{selectedProducts.length} Products Selected</p>
                    <div className="flex items-center gap-4">
                        <button className="font-semibold text-gray-700 flex items-center gap-2">
                            <Edit size={16}/> Bulk Edit
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            className="font-semibold text-red-600 flex items-center gap-2"
                        >
                            <Trash2 size={16}/> Delete Selected
                        </button>
                        <button 
                            onClick={() => setSelectedProducts([])} 
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X size={20}/>
                        </button>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
                mode={modalMode}
            />
        </div>
    );
};

// --- Main App Component ---
export default function Inventory() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: '0',
        lowStockItems: 0,
        outOfStockItems: 0
    });

    // Fetch stats on component mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await supabase
                    .from('inventory')
                    .select('*');
                
                if (error) throw error;
                
                const inventoryStats = {
                    totalProducts: data?.length || 0,
                    totalValue: data?.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2) || '0',
                    lowStockItems: data?.filter(item => item.stock_available <= 10 && item.stock_available > 0).length || 0,
                    outOfStockItems: data?.filter(item => item.stock_available === 0).length || 0
                };
                
                setStats(inventoryStats);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-6">
            <Header />
            
            {/* Statistics Cards */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    change="Live" 
                    changeType="increase" 
                    icon={Package}
                />
                <StatCard 
                    title="Total Value" 
                    value={`₹${stats.totalValue}`} 
                    change="Live" 
                    changeType="increase" 
                    icon={DollarSign}
                />
                <StatCard 
                    title="Low Stock" 
                    value={stats.lowStockItems} 
                    change="Live" 
                    changeType="decrease" 
                    icon={AlertCircle}
                />
                <StatCard 
                    title="Out of Stock" 
                    value={stats.outOfStockItems} 
                    change="Live" 
                    changeType="increase" 
                    icon={XCircle}
                />
            </div>
            
            {/* Inventory Table */}
            <InventoryTable onStatsUpdate={setStats} />
        </div>
    );
} 