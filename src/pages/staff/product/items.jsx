import React from 'react';

// Product Items Component
export default function ProductItems() {
    // Placeholder data for demonstration
    const items = [
        { id: 1, name: 'Masala Dosa', price: 45 },
        { id: 2, name: 'Veg Puff', price: 20 },
        { id: 3, name: 'Filter Coffee', price: 15 },
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-200 max-w-lg mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Items</h2>
            <ul className="divide-y divide-gray-100">
                {items.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-gray-500">₹{item.price}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
} 