// This component is a web-based implementation using React and Tailwind CSS.
// It creates a comprehensive inventory management system for staff to manage all product data.
// To run this, you would need React and the lucide-react library.
// npm install react react-dom lucide-react

import React, { useState } from 'react';
// Icons for the UI
import { 
    Plus, Download, Settings2, SlidersHorizontal, ArrowUpDown, Table, BarChart2,
    Star, Trash2, Edit, X, TrendingUp, Clock, User, CreditCard, CheckCircle, 
    XCircle, AlertCircle, Package, Phone, MapPin, Calendar, DollarSign, Search,
    Filter, Upload, Eye, EyeOff, Tag, Image as ImageIcon
} from 'lucide-react';

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

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'In Stock': 'bg-green-100 text-green-700 border-green-200',
        'Out of Stock': 'bg-red-100 text-red-700 border-red-200',
        'Low Stock': 'bg-orange-100 text-orange-700 border-orange-200',
        'Discontinued': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
            {status}
        </span>
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

// Rating Component
const Rating = ({ value }) => (
    <div className="flex items-center gap-1">
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
        <span className="font-semibold text-gray-700">{value.toFixed(1)}</span>
    </div>
);

// Product Image Component
const ProductImage = ({ image, name, onEdit }) => (
    <div className="relative group">
        <img 
            src={image} 
            alt={name} 
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src='https://placehold.co/64x64/F3F4F6/9CA3AF?text=Image'; 
            }}
        />
        <button 
            onClick={onEdit}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
        >
            <ImageIcon size={16} className="text-white" />
        </button>
    </div>
);

// Search and Filter Component
const SearchAndFilter = ({ onSearch, onFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const categories = ['all', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];
    const statuses = ['all', 'In Stock', 'Out of Stock', 'Low Stock', 'Discontinued'];

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        onFilter({ category: value, status: selectedStatus });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);
        onFilter({ category: selectedCategory, status: value });
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                {/* Category Filter */}
                <div className="lg:w-48">
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Status Filter */}
                <div className="lg:w-48">
                    <select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Status' : status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

// Add/Edit Product Modal Component
const ProductModal = ({ isOpen, onClose, product, onSave, mode }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || 'Snacks',
        status: product?.status || 'In Stock',
        stock: product?.stock || '',
        image: product?.image || '',
        rating: product?.rating || 4.5,
        deliveryTime: product?.deliveryTime || '20-25 mins',
        cuisine: product?.cuisine || 'Indian'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
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
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Desserts">Desserts</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                step="0.1"
                                min="0"
                                max="5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                            <input
                                type="text"
                                name="deliveryTime"
                                value={formData.deliveryTime}
                                onChange={handleChange}
                                placeholder="e.g., 20-25 mins"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                            <input
                                type="text"
                                name="cuisine"
                                value={formData.cuisine}
                                onChange={handleChange}
                                placeholder="e.g., Indian, Chinese"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
const InventoryTable = () => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProduct, setEditingProduct] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Initial inventory data
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Masala Dosa',
            description: 'Crispy dosa with spiced potato filling',
            price: 120,
            category: 'Breakfast',
            status: 'In Stock',
            stock: 50,
            image: 'https://images.unsplash.com/photo-1668665632120-d3a3f5b08076?q=80&w=2070&auto=format&fit=crop',
            rating: 4.7,
            deliveryTime: '20-25 mins',
            cuisine: 'South Indian'
        },
        {
            id: 2,
            name: 'Samosa',
            description: 'Crispy pastry with spiced potato and peas',
            price: 25,
            category: 'Snacks',
            status: 'In Stock',
            stock: 100,
            image: 'https://images.unsplash.com/photo-1643282333213-a40091c8d5a1?q=80&w=1964&auto=format&fit=crop',
            rating: 4.5,
            deliveryTime: '10-15 mins',
            cuisine: 'Indian'
        },
        {
            id: 3,
            name: 'Filter Coffee',
            description: 'Traditional South Indian filter coffee',
            price: 30,
            category: 'Beverages',
            status: 'In Stock',
            stock: 200,
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop',
            rating: 4.8,
            deliveryTime: '5-10 mins',
            cuisine: 'South Indian'
        },
        {
            id: 4,
            name: 'Chicken Biryani',
            description: 'Aromatic rice dish with tender chicken',
            price: 250,
            category: 'Lunch',
            status: 'Low Stock',
            stock: 15,
            image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop',
            rating: 4.9,
            deliveryTime: '30-35 mins',
            cuisine: 'Hyderabadi'
        },
        {
            id: 5,
            name: 'Paneer Butter Masala',
            description: 'Cottage cheese in rich tomato gravy',
            price: 180,
            category: 'Dinner',
            status: 'In Stock',
            stock: 30,
            image: 'https://images.unsplash.com/photo-1565557623262-b27e252489a9?q=80&w=1965&auto=format&fit=crop',
            rating: 4.6,
            deliveryTime: '25-30 mins',
            cuisine: 'North Indian'
        },
        {
            id: 6,
            name: 'Gulab Jamun',
            description: 'Sweet milk solids in sugar syrup',
            price: 40,
            category: 'Desserts',
            status: 'Out of Stock',
            stock: 0,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop',
            rating: 4.4,
            deliveryTime: '10-15 mins',
            cuisine: 'Indian'
        }
    ]);

    // Initialize filtered products
    React.useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    const handleSearch = (searchTerm) => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleFilter = ({ category, status }) => {
        let filtered = products;
        
        if (category !== 'all') {
            filtered = filtered.filter(product => product.category === category);
        }
        
        if (status !== 'all') {
            filtered = filtered.filter(product => product.status === status);
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

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(product => product.id !== id));
            setSelectedProducts(prev => prev.filter(productId => productId !== id));
        }
    };

    const handleSaveProduct = (formData) => {
        if (modalMode === 'add') {
            const newProduct = {
                ...formData,
                id: Math.max(...products.map(p => p.id)) + 1
            };
            setProducts(prev => [...prev, newProduct]);
        } else {
            setProducts(prev => prev.map(product => 
                product.id === editingProduct.id ? { ...formData, id: product.id } : product
            ));
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
            setSelectedProducts([]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
            {/* Search and Filter */}
            <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
            
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
                            <th className="p-3 font-medium">Rating</th>
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
                                            image={product.image} 
                                            name={product.name}
                                            onEdit={() => handleEditProduct(product)}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.cuisine}</p>
                                            <p className="text-xs text-gray-400">{product.deliveryTime}</p>
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
                                    <p className="font-medium text-gray-600">{product.stock}</p>
                                </td>
                                <td className="p-3">
                                    <StatusBadge status={product.status} />
                                </td>
                                <td className="p-3">
                                    <Rating value={product.rating} />
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
    return (
        <div className="bg-gray-100 min-h-screen font-sans p-6">
            <Header />
            
            {/* Statistics Cards */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <StatCard 
                    title="Total Products" 
                    value="156" 
                    change="+12 this month" 
                    changeType="increase" 
                    icon={Package}
                />
                <StatCard 
                    title="In Stock" 
                    value="142" 
                    change="+8 this week" 
                    changeType="increase" 
                    icon={CheckCircle}
                />
                <StatCard 
                    title="Low Stock" 
                    value="8" 
                    change="-3 today" 
                    changeType="decrease" 
                    icon={AlertCircle}
                />
                <StatCard 
                    title="Out of Stock" 
                    value="6" 
                    change="+2 today" 
                    changeType="increase" 
                    icon={XCircle}
                />
            </div>
            
            {/* Inventory Table */}
            <InventoryTable />
        </div>
    );
} 