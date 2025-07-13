import React from 'react';
import { MapPin, User, ShoppingCart, Plus, ChevronDown } from 'lucide-react';

// --- Mock Data ---
const saladData = [
    {
        name: "Fresh and Health Salad",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
        calories: 60,
        serves: 4,
        price: "2.65",
        highlighted: false,
    },
    {
        name: "Cashewnut Chicken Salad",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1974&auto=format&fit=crop",
        calories: 80,
        serves: 4,
        price: "2.65",
        highlighted: true,
    },
    {
        name: "Crunchy Cashew Salad",
        image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop",
        calories: 70,
        serves: 4,
        price: "2.65",
        highlighted: false,
    },
    {
        name: "Sesame Dressing Salad",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17021?q=80&w=2053&auto=format&fit=crop",
        calories: 65,
        serves: 4,
        price: "2.65",
        highlighted: false,
    },
];

// --- Salad Card Component ---
const SaladCard = ({ salad }) => (
    <div className={`relative rounded-3xl p-6 transition-all duration-300 ease-in-out transform ${
        salad.highlighted 
        ? 'bg-amber-300 scale-100 md:scale-105 shadow-2xl' 
        : 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-2'
    }`}>
        <img 
            src={salad.image} 
            alt={salad.name}
            className="w-36 h-36 object-cover rounded-full mx-auto -mt-16 border-4 border-white shadow-md"
        />
        <div className="text-center mt-4">
            <h3 className="text-xl font-bold text-gray-900">{salad.name}</h3>
            <div className="mt-2 text-sm text-gray-500 flex justify-center gap-4">
                <span>{salad.calories} calories</span>
                <span>{salad.serves} persons</span>
            </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
            <p className="text-2xl font-extrabold text-gray-900">${salad.price}</p>
            <button className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                salad.highlighted ? 'bg-amber-400 hover:bg-amber-500' : 'bg-gray-200 hover:bg-gray-300'
            }`}>
                <Plus className="w-6 h-6 text-gray-900"/>
            </button>
        </div>
    </div>
);

// --- Main Hero Section Component ---
const HeroSection = () => {
  return (
    <div className="relative bg-stone-50 min-h-screen font-sans overflow-hidden pt-36 md:pt-40">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64">
            <img src="https://www.transparentpng.com/thumb/basil/O0o3Kq-basil-leaf-transparent-background.png" alt="basil leaf" className="w-full h-full opacity-50 transform rotate-45" />
        </div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72">
            <img src="https://png.pngtree.com/png-clipart/20230115/ourmid/pngtree-red-chili-transparent-background-png-image_6561123.png" alt="chili pepper" className="w-full h-full opacity-60 transform -rotate-45" />
        </div>
        
        <div className="relative z-10">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 md:py-20">
                <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                Your Hunger Doesn’t 
                    <br />
                    Wait <span className="text-amber-500">Neither Should You.</span>
                </h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                    Aside from their natural good taste and great crunchy texture alongside wonderful colors and fragrances, eating a large serving of fresh.
                </p>
            </main>
            
            {/* Salad Cards Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-24">
                    {saladData.map((salad) => (
                        <SaladCard key={salad.name} salad={salad} />
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default HeroSection; 