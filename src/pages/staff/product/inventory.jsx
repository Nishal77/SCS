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
    Filter, Upload, Eye, EyeOff, Tag, Image as ImageIcon, Star, ChevronDown
} from 'lucide-react';
import { formatImageUrl, formatProductForUser } from '@/lib/image-utils';
import supabase from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import IndianClock from '../components/IndianClock';


// --- Reusable Components ---

// Header Component
const Header = ({ onRefresh }) => (
    <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage all canteen products, prices, and availability</p>
        </div>
        <div className="flex items-center gap-4">
            <IndianClock />
            <div className="flex items-center gap-2 text-gray-500">
                <div className="flex -space-x-2">
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=S" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 1"/>
                    <img src="https://placehold.co/32x32/EFEFEF/333?text=C" className="w-8 h-8 rounded-full border-2 border-white" alt="staff 2"/>
                </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                <Download size={16} />
                <span>Extract Data (Monthly)</span>
            </button>
        </div>
    </header>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color = "default", subtitle = null }) => {
    const getColorClasses = () => {
        switch (color) {
            case "red":
                return {
                    value: "text-red-600",
                    change: "text-red-500",
                    dot: "bg-red-500"
                };
            case "orange":
                return {
                    value: "text-orange-600",
                    change: "text-orange-500",
                    dot: "bg-orange-500"
                };
            case "green":
                return {
                    value: "text-gray-800",
                    change: "text-green-500",
                    dot: "bg-green-500"
                };
            default:
                return {
                    value: "text-gray-800",
                    change: "text-green-500",
                    dot: "bg-green-500"
                };
        }
    };

    const colors = getColorClasses();

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative">
            {/* Live indicator in top right */}
            <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-sm font-medium ${colors.change}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${colors.dot}`}></div>
                <span className="tracking-wide">{change}</span>
            </div>
            
            <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
                <p className={`text-4xl font-bold ${colors.value}`}>{value}</p>
                {subtitle && title !== "Out of Stock" && (
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{subtitle}</p>
                )}
            </div>
        </div>
    );
};

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
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyles}`}>
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
        'Combo': 'bg-orange-100 text-orange-700 border-orange-200',
        'Chats Items': 'bg-red-100 text-red-700 border-red-200',
        'Juice': 'bg-cyan-100 text-cyan-700 border-cyan-200',
        'Milkshake': 'bg-pink-100 text-pink-700 border-pink-200',
        'Icecream': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return (
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${categoryStyles[category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {category}
        </span>
    );
};



// Product Image Component
const ProductImage = ({ image, name, onEdit }) => {
    // Only show image if it exists
    if (!image || image.trim() === '') {
        return (
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <ImageIcon size={20} className="text-gray-400" />
            </div>
        );
    }
    
    return (
        <div className="relative group">
            <img 
                src={image} 
                alt={name || 'Product'}
                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
            />
            <button 
                onClick={onEdit}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
            >
                <ImageIcon size={14} className="text-white" />
            </button>
        </div>
    );
};

// Filter Options Component
const FilterOptions = ({ onFilter, activeFilter, onCategorySelect, selectedCategory }) => {
    const filters = [
        { id: 'all', label: 'Menu All', icon: '🍽️' },
        { id: 'category', label: 'Category', icon: '📂' },
        { id: 'veg', label: 'Vegetarian', icon: '🥬' },
        { id: 'non-veg', label: 'Non-Vegetarian', icon: '🍗' },
        { id: 'special', label: "Today's Special", icon: '⭐' }
    ];

    const categories = ['All Categories', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Combo', 'Chats Items', 'Juice', 'Milkshake', 'Icecream'];

    const handleFilterClick = (filterId) => {
        onFilter(filterId);
    };

    const handleCategoryChange = (e) => {
        onCategorySelect(e.target.value);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col gap-4">
                <div className="flex gap-3 flex-wrap">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterClick(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                activeFilter === filter.id
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
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
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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
        category: product?.category || '',
        deliveryTime: product?.min_to_cook || '',
        stockConstant: product?.stock_constant || '',
        isTodaysSpecial: product?.is_todays_special || false,
        foodType: product?.food_type || 'veg',
        image: product?.image_url || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                {mode === 'add' ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <p className="text-gray-500">Fill in the details to {mode === 'add' ? 'add' : 'update'} your product</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <X size={24} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            step="0.01"
                                            onBlur={(e) => {
                                                // Format price to 2 decimal places on blur
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value) && value >= 0) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        price: value.toFixed(2)
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Enter price in Indian Rupees (₹)</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Breakfast">Breakfast</option>
                                        <option value="Lunch">Lunch</option>
                                        <option value="Dinner">Dinner</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Combo">Combo</option>
                                        <option value="Chats Items">Chats Items</option>
                                        <option value="Juice">Juice</option>
                                        <option value="Milkshake">Milkshake</option>
                                        <option value="Icecream">Icecream</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Food Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:border-green-300 transition-colors duration-200 bg-gray-50 hover:bg-white">
                                            <input
                                                type="radio"
                                                name="foodType"
                                                value="veg"
                                                checked={formData.foodType === 'veg'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:border-red-300 transition-colors duration-200 bg-gray-50 hover:bg-white">
                                            <input
                                                type="radio"
                                                name="foodType"
                                                value="non-veg"
                                                checked={formData.foodType === 'non-veg'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Non-Vegetarian</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock & Delivery Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Stock & Delivery</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Delivery Time (min)</label>
                                    <input
                                        type="number"
                                        name="deliveryTime"
                                        value={formData.deliveryTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        placeholder="0"
                                        required
                                        min="0"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Total Stock</label>
                                    <input
                                        type="number"
                                        name="stockConstant"
                                        value={formData.stockConstant}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        placeholder="Total stock available"
                                        required
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available stock will be automatically calculated based on customer orders
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Product Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                                    placeholder="Describe your product..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Special Features Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">4</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Special Features</h3>
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isTodaysSpecial"
                                        checked={formData.isTodaysSpecial}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                isTodaysSpecial: e.target.checked
                                            }));
                                        }}
                                        className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900">Mark as Today's Special</span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            This item will appear in the "Hot Picks of the Day" section on the user dashboard
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">5</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Product Image</h3>
                            </div>
                            
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 transition-colors duration-200">
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

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {mode === 'add' ? 'Add Product' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
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
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [notification, setNotification] = useState(null);

    // Show notification function
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
            setLastRefresh(new Date());
            
            // Calculate real-time stats
            const totalProducts = data?.length || 0;
            const totalValue = data?.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) || 0;
            const inStock = data?.filter(item => (item.stock_available || 0) > 0).length || 0;
            const lowStock = data?.filter(item => (item.stock_available || 0) <= 10 && (item.stock_available || 0) > 0).length || 0;
            const outOfStock = data?.filter(item => (item.stock_available || 0) === 0).length || 0;
            const vegItems = data?.filter(item => item.food_type === 'veg').length || 0;
            const nonVegItems = data?.filter(item => item.food_type === 'non-veg').length || 0;
            const todaysSpecial = data?.filter(item => item.is_todays_special).length || 0;
            
            // Get out of stock item names
            const outOfStockItems = data?.filter(item => (item.stock_available || 0) === 0).map(item => item.item_name) || [];
            const outOfStockText = outOfStockItems.length > 0 ? outOfStockItems.join(', ') : null;
            
            const inventoryStats = {
                totalProducts,
                totalValue: totalValue.toFixed(2),
                inStock,
                lowStock,
                outOfStock,
                vegItems,
                nonVegItems,
                todaysSpecial,
                outOfStockItems: outOfStockText
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

    // Set up real-time refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchInventory();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [fetchInventory]);

    // Set up real-time subscription for immediate updates
    useEffect(() => {
        const subscription = supabase
            .channel('inventory_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory'
                },
                (payload) => {
                    console.log('Real-time inventory update received in staff view:', payload);
                    
                    // Handle different types of changes
                    if (payload.eventType === 'UPDATE') {
                        // Update existing product
                        setProducts(prev => prev.map(item => 
                            item.id === payload.new.id 
                                ? { ...item, ...payload.new }
                                : item
                        ));
                        
                        // Update filtered products as well
                        setFilteredProducts(prev => prev.map(item => 
                            item.id === payload.new.id 
                                ? { ...item, ...payload.new }
                                : item
                        ));
                    } else if (payload.eventType === 'INSERT') {
                        // Add new product
                        setProducts(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        // Remove deleted product
                        setProducts(prev => prev.filter(item => item.id !== payload.old.id));
                        setFilteredProducts(prev => prev.filter(item => item.id !== payload.old.id));
                    }
                    
                    // Update last refresh time
                    setLastRefresh(new Date());
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    // Apply current filter when products change
    useEffect(() => {
        if (products.length > 0) {
            applyFilters(activeFilter, selectedCategory);
        }
    }, [products, activeFilter, selectedCategory]);

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
        
        console.log('Applying filter:', filterType, 'Category:', category, 'Total products:', products.length);
        
        switch (filterType) {
            case 'category':
                // Filter by specific category if selected
                if (category && category !== 'All Categories') {
                    filtered = products.filter(product => product.category === category);
                    console.log('Category filter applied:', category, 'Filtered count:', filtered.length);
                } else {
                    // Show all products grouped by category
                    filtered = products.sort((a, b) => a.category.localeCompare(b.category));
                    console.log('All categories shown, sorted by category');
                }
                break;
            case 'veg':
                // Show only vegetarian items
                filtered = products.filter(product => product.food_type === 'veg');
                console.log('Vegetarian filter applied, filtered count:', filtered.length);
                break;
            case 'non-veg':
                // Show only non-vegetarian items
                filtered = products.filter(product => product.food_type === 'non-veg');
                console.log('Non-vegetarian filter applied, filtered count:', filtered.length);
                break;
            case 'special':
                // Show only today's special items
                filtered = products.filter(product => product.is_todays_special === true);
                console.log('Today\'s Special filter applied, filtered count:', filtered.length);
                break;
            case 'all':
            default:
                // Show all products
                filtered = products;
                console.log('All products shown');
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
                
                // Reapply current filter after deleting product
                setTimeout(() => {
                    applyFilters(activeFilter, selectedCategory);
                }, 100);
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete product');
            }
        }
    };

    const handleSaveProduct = async (formData) => {
        try {
            console.log('Saving product with form data:', formData);
            
            // Validate price
            const price = parseFloat(formData.price);
            if (isNaN(price) || price < 0) {
                alert('Please enter a valid price (must be a positive number)');
                return;
            }
            
            // Get current user session for added_by
            const userSession = localStorage.getItem('user_session');
            const sessionData = userSession ? JSON.parse(userSession) : null;
            const addedBy = sessionData?.id || null;
            
            console.log('User session data:', sessionData);
            console.log('Added by user ID:', addedBy);

            if (modalMode === 'add') {
                // Add new product - set initial available stock equal to total stock
                const { data: newProduct, error } = await supabase
                    .from('inventory')
                    .insert({
                        item_name: formData.name,
                        description: formData.description || '',
                        price: price, // Use validated price
                        category: formData.category,
                        image_url: formData.image || '',
                        min_to_cook: parseInt(formData.deliveryTime) || 0,
                        stock_constant: parseInt(formData.stockConstant) || 0,
                        stock_available: parseInt(formData.stockConstant) || 0, // Initially equal to total stock
                        is_todays_special: formData.isTodaysSpecial || false,
                        food_type: formData.foodType || 'veg',
                        added_by: addedBy
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                setProducts(prev => [newProduct, ...prev]);
                console.log('Product added successfully:', newProduct);
            } else if (editingProduct) {
                // Update existing product - don't change available stock, let system manage it
                const { data: updatedProduct, error } = await supabase
                    .from('inventory')
                    .update({
                        item_name: formData.name,
                        description: formData.description || '',
                        price: price, // Use validated price
                        category: formData.category,
                        image_url: formData.image || '',
                        min_to_cook: parseInt(formData.deliveryTime) || 0,
                        stock_constant: parseInt(formData.stockConstant) || 0,
                        // stock_available remains unchanged - managed by system
                        is_todays_special: formData.isTodaysSpecial || false,
                        food_type: formData.foodType || 'veg'
                    })
                    .eq('id', editingProduct.id)
                    .select()
                    .single();
                
                if (error) throw error;
                setProducts(prev => prev.map(product => product.id === editingProduct.id ? updatedProduct : product));
                console.log('Product updated successfully:', updatedProduct);
                
                // Show success message for price updates
                if (editingProduct.price !== price) {
                    console.log(`Price updated from ₹${editingProduct.price} to ₹${price}`);
                    showNotification(`Price updated for ${editingProduct.item_name} to ₹${price.toFixed(2)}`, 'success');
                }
            }
            
            // Close modal
            setIsModalOpen(false);
            setEditingProduct(null);
            
            // Reapply current filter after saving product
            setTimeout(() => {
                applyFilters(activeFilter, selectedCategory);
            }, 100);
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
                
                // Reapply current filter after bulk delete
                setTimeout(() => {
                    applyFilters(activeFilter, selectedCategory);
                }, 100);
            } catch (err) {
                console.error('Bulk delete error:', err);
                alert('Failed to delete products');
            }
        }
    };

    const handleToggleSpecial = async (product) => {
        try {
            const newIsSpecial = !product.is_todays_special;
            const { data: updatedProduct, error } = await supabase
                .from('inventory')
                .update({ is_todays_special: newIsSpecial })
                .eq('id', product.id)
                .select()
                .single();

            if (error) throw error;
            setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
            console.log(`Product ${product.item_name} is now ${newIsSpecial ? 'Today\'s Special' : 'not Today\'s Special'}`);
            
            // Reapply current filter after updating product
            setTimeout(() => {
                applyFilters(activeFilter, selectedCategory);
            }, 100);
        } catch (err) {
            console.error('Error toggling special:', err);
            alert('Failed to toggle Today\'s Special status');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleAddProduct}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mb-4 p-4 rounded-lg border ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? (
                            <CheckCircle size={20} className="text-green-600" />
                        ) : (
                            <AlertCircle size={20} className="text-red-600" />
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                            <th className="p-4 font-medium w-10">
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
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </th>
                            <th className="p-4 font-medium">Product</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Stock</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${selectedProducts.includes(product.id) ? 'bg-blue-50' : 'bg-white'}`}>
                                <td className="p-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleProduct(product.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <ProductImage 
                                            image={product.image_url} 
                                            name={product.item_name}
                                            onEdit={() => handleEditProduct(product)}
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-gray-800">{product.item_name}</p>
                                                {product.is_todays_special && (
                                                    <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Star size={12} className="fill-current" />
                                                        Special
                                                    </span>
                                                )}
                                                {product.food_type && (
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                                                        product.food_type === 'veg' 
                                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                                            : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                        {product.food_type === 'veg' ? '🥬' : '🍗'}
                                                        {product.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">{product.description || 'No description'}</p>
                                            <p className="text-xs text-gray-400">{product.min_to_cook || 0} mins</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <CategoryBadge category={product.category} />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-800">₹{parseFloat(product.price || 0).toFixed(2)}</p>
                                        {product.price !== editingProduct?.price && editingProduct && (
                                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                Updated
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium text-gray-600">{product.stock_available || 0}</p>
                                        <p className="text-xs text-gray-500">of {product.stock_constant || 0}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge stockAvailable={product.stock_available} stockConstant={product.stock_constant} />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleEditProduct(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleSpecial(product)}
                                            className={`p-2 rounded-lg transition-colors duration-200 ${
                                                product.is_todays_special 
                                                    ? 'text-orange-600 hover:bg-orange-100' 
                                                    : 'text-gray-400 hover:bg-gray-100 hover:text-orange-600'
                                            }`}
                                        >
                                            <Star size={16} className={product.is_todays_special ? 'fill-current' : ''} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
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
        totalValue: '0.00',
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        vegItems: 0,
        nonVegItems: 0,
        todaysSpecial: 0,
        outOfStockItems: null
    });

    // Update stats when inventory changes
    const handleStatsUpdate = (newStats) => {
        setStats(newStats);
    };

    // Handle manual refresh
    const handleRefresh = () => {
        // This will trigger a refresh of the inventory table
        // The InventoryTable component will handle the actual refresh
        console.log('Manual refresh triggered');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans p-6">
            <div className="max-w-7xl mx-auto">
                <Header onRefresh={handleRefresh} />
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 mb-8">
                    <StatCard 
                        title="Total Products" 
                        value={stats.totalProducts} 
                        change="Live" 
                        changeType="increase" 
                        icon={Package}
                        color="green"
                    />
                    <StatCard 
                        title="Total Value" 
                        value={`₹${stats.totalValue}`} 
                        change="Live" 
                        changeType="increase" 
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard 
                        title="In Stock" 
                        value={stats.inStock} 
                        change="Live" 
                        changeType="increase" 
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatCard 
                        title="Low Stock" 
                        value={stats.lowStock} 
                        change="Live" 
                        changeType="increase" 
                        icon={AlertCircle}
                        color="orange"
                    />
                    <StatCard 
                        title="Out of Stock" 
                        value={stats.outOfStock} 
                        change="Live" 
                        changeType="increase" 
                        icon={XCircle}
                        color="red"
                    />
                    <StatCard 
                        title="Vegetarian" 
                        value={stats.vegItems} 
                        change="Live" 
                        changeType="increase" 
                        icon={Package}
                        color="green"
                    />
                    <StatCard 
                        title="Non-Vegetarian" 
                        value={stats.nonVegItems} 
                        change="Live" 
                        changeType="increase" 
                        icon={Package}
                        color="green"
                    />
                    <StatCard 
                        title="Today's Special" 
                        value={stats.todaysSpecial} 
                        change="Live" 
                        changeType="increase" 
                        icon={Star}
                        color="green"
                    />
                </div>
                
                {/* Inventory Table */}
                <InventoryTable onStatsUpdate={handleStatsUpdate} />
            </div>
        </div>
    );
} 