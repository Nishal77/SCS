import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, Image as ImageIcon, Save, X, 
    Upload, Eye, EyeOff, Settings2
} from 'lucide-react';
import supabase from '@/lib/supabase';
import { getCategoryImage } from '@/lib/category-utils';

// Category Card Component
const CategoryCard = ({ category, onEdit, onDelete, onToggleActive }) => (
    <div className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        category.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
    }`}>
        {/* Category Image */}
        <div className="relative mb-4">
            <img
                src={category.image_url || getCategoryImage(category.name, 200, 200)}
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                    e.target.src = getCategoryImage(category.name, 200, 200);
                }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
                <button
                    onClick={() => onEdit(category)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                    title="Edit category"
                >
                    <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    onClick={() => onDelete(category.id)}
                    className="p-2 bg-red-100/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-200 transition-colors"
                    title="Delete category"
                >
                    <Trash2 className="w-4 h-4 text-red-600" />
                </button>
            </div>
            {!category.is_active && (
                <div className="absolute inset-0 bg-gray-500/20 rounded-lg flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Inactive
                    </span>
                </div>
            )}
        </div>

        {/* Category Info */}
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            {/* Removed description and color scheme */}

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => onToggleActive(category.id, !category.is_active)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        category.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {category.is_active ? 'Active' : 'Inactive'}
                </button>
                {/* Removed sort order display */}
            </div>
        </div>
    </div>
);

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, category, onSave, mode }) => {
    const [formData, setFormData] = useState({
        name: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category && mode === 'edit') {
            setFormData({
                name: category.name || '',
                is_active: category.is_active !== undefined ? category.is_active : true
            });
            setImagePreview(category.image_url || '');
        } else {
            setFormData({
                name: '',
                is_active: true
            });
            setImagePreview('');
        }
        setImageFile(null);
    }, [category, mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = imagePreview;

            // Upload new image if selected
            if (imageFile) {
                const fileName = `category-${Date.now()}-${imageFile.name}`;
                const filePath = `categories/${fileName}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-menu')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-menu')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            const categoryData = {
                ...formData,
                image_url: imageUrl || null
            };

            if (mode === 'edit') {
                const { error } = await supabase
                    .from('categories')
                    .update(categoryData)
                    .eq('id', category.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([categoryData]);
                if (error) throw error;
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error saving category: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (file) => {
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {mode === 'edit' ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., Breakfast, Lunch, Dinner"
                        />
                    </div>

                    {/* Description, Color Scheme, Sort Order - removed */}

                    {/* Category Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                        </label>
                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Upload a custom image for this category
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e.target.files[0])}
                                        className="hidden"
                                        id="category-image-upload"
                                    />
                                    <label
                                        htmlFor="category-image-upload"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Choose Image
                                    </label>
                                </div>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview('');
                                            setImageFile(null);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is-active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="is-active" className="text-sm font-medium text-gray-700">
                            Category is active
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {mode === 'edit' ? 'Update Category' : 'Create Category'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Category Management Component
const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [searchTerm, setSearchTerm] = useState('');
    // Removed sort state

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Error fetching categories: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            await fetchCategories();
            alert('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category: ' + error.message);
        }
    };

    const handleToggleActive = async (id, isActive) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;
            
            await fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Error updating category: ' + error.message);
        }
    };

    const handleSaveCategory = () => {
        fetchCategories();
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
                    <p className="text-gray-600">Manage food categories and their images</p>
                </div>
                <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <button
                    onClick={fetchCategories}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors h-10 self-start"
                    title="Refresh categories"
                >
                    <Settings2 className="w-5 h-5" />
                </button>
            </div>

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={handleAddCategory}
                            className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {/* Category Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
                onSave={handleSaveCategory}
                mode={modalMode}
            />
        </div>
    );
};

export default CategoryManagement;
