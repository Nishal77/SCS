import React from 'react';
import { CATEGORY_IMAGES, getCategoryImage, getCategoryBadgeImage, getCategoryFilterImage, getCategoryCarouselImage } from '../lib/category-utils';

const CategoryImageDemo = () => {
    const categories = Object.keys(CATEGORY_IMAGES);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Category Images Demo</h1>
                
                {/* All Categories Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Categories with Images</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map(category => (
                            <div key={category} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <img 
                                    src={CATEGORY_IMAGES[category]} 
                                    alt={category}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-semibold text-gray-800 text-center">{category}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Different Image Sizes */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Different Image Sizes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Badge Size (32x32) */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4">Badge Size (32x32)</h3>
                            <div className="space-y-3">
                                {categories.slice(0, 5).map(category => (
                                    <div key={category} className="flex items-center gap-3">
                                        <img 
                                            src={getCategoryBadgeImage(category)} 
                                            alt={category}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                        <span className="text-sm text-gray-600">{category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filter Size (24x24) */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4">Filter Size (24x24)</h3>
                            <div className="space-y-3">
                                {categories.slice(0, 5).map(category => (
                                    <div key={category} className="flex items-center gap-3">
                                        <img 
                                            src={getCategoryFilterImage(category)} 
                                            alt={category}
                                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                        />
                                        <span className="text-sm text-gray-600">{category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carousel Size (200x200) */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4">Carousel Size (200x200)</h3>
                            <div className="space-y-3">
                                {categories.slice(0, 5).map(category => (
                                    <div key={category} className="flex items-center gap-3">
                                        <img 
                                            src={getCategoryCarouselImage(category)} 
                                            alt={category}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                        />
                                        <span className="text-sm text-gray-600">{category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Sizes */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Custom Image Sizes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.slice(0, 8).map(category => (
                            <div key={category} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                                <img 
                                    src={getCategoryImage(category, 150, 100)} 
                                    alt={category}
                                    className="w-full h-24 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-semibold text-gray-800 text-sm">{category}</h3>
                                <p className="text-xs text-gray-500">150x100</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Utility Functions Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Utility Functions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Image Functions:</h3>
                            <ul className="space-y-1 text-gray-600">
                                <li>• <code>getCategoryImage(category, width, height)</code></li>
                                <li>• <code>getCategoryBadgeImage(category)</code> - 32x32</li>
                                <li>• <code>getCategoryFilterImage(category)</code> - 24x24</li>
                                <li>• <code>getCategoryCarouselImage(category)</code> - 200x200</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Helper Functions:</h3>
                            <ul className="space-y-1 text-gray-600">
                                <li>• <code>getAvailableCategories()</code></li>
                                <li>• <code>hasCategoryImage(category)</code></li>
                                <li>• <code>CATEGORY_IMAGES</code> - Direct access to image URLs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryImageDemo;
