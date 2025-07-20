import React, { useState, useEffect } from 'react';
import { Check, ChefHat, ClipboardCheck, ShoppingBasket, CircleUserRound, QrCode, Utensils, Clock, MessageSquare, Info } from 'lucide-react';

// --- Reusable Components ---

// 1. Horizontal Status Step Component
const StatusStep = ({ icon, title, isCompleted, isCurrent }) => (
  <div className="flex flex-col items-center text-center w-full relative">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 z-10 ${isCompleted ? 'bg-green-500 shadow-lg shadow-green-500/20' : isCurrent ? 'bg-orange-500 shadow-lg shadow-orange-500/30 animate-pulse' : 'bg-gray-200'}`}>
      {React.cloneElement(icon, { size: 24, className: 'text-white' })}
    </div>
    <p className={`font-semibold mt-2 text-sm transition-colors duration-500 ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>{title}</p>
  </div>
);

// 2. Order Item Component
const OrderItem = ({ name, quantity }) => (
    <div className="flex justify-between items-center text-sm text-gray-700 py-2.5">
        <p>{name}</p>
        <p className="font-semibold text-gray-800">x{quantity}</p>
    </div>
);

// 3. User Details Component
const UserDetails = () => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <img 
                src="https://placehold.co/60x60/e0e0e0/333?text=NP" 
                alt="User Avatar" 
                className="w-12 h-12 rounded-full"
            />
            <div>
                <p className="font-bold text-gray-800">Nishal N Poojary</p>
                <p className="text-sm text-gray-500">2024mca039@mite.ac.in</p>
            </div>
        </div>
        <button className="font-semibold text-sm text-orange-600 hover:underline">Change</button>
    </div>
);

// 4. Order Detail Row
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        {icon}
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-sm text-gray-800">{value}</p>
        </div>
    </div>
);


// --- Main Order Tracker Component ---
const CanteenOrderTracker = () => {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        { icon: <ClipboardCheck />, title: 'Order Placed' },
        { icon: <ChefHat />, title: 'In the Kitchen' },
        { icon: <ShoppingBasket />, title: 'Ready for Pickup' },
        { icon: <Check />, title: 'Delivered' },
    ];

    // Simulate live status updates for demonstration
    useEffect(() => {
        if (statusIndex < statuses.length - 1) {
            const timer = setTimeout(() => {
                setStatusIndex(statusIndex + 1);
            }, 4000); // Update status every 4 seconds
            return () => clearTimeout(timer);
        }
    }, [statusIndex]);

    const progressPercentage = (statusIndex / (statuses.length - 1)) * 100;

  return (
    <div className="bg-slate-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="text-center mb-6 w-full max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Order Confirmed</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">We've received your order and our chefs are getting started on it right away!</p>
        </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
        
        {/* User Details Section */}
        <UserDetails />

        {/* Live Status Section */}
        <div className="mb-8">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Live Status</h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center relative">
                    {/* Progress Bar */}
                    <div className="absolute top-6 left-0 w-full h-1.5 bg-gray-200 rounded-full"></div>
                    <div 
                        className="absolute top-6 left-0 h-1.5 bg-green-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>

                    {statuses.map((status, index) => (
                        <StatusStep 
                            key={index}
                            icon={status.icon}
                            title={status.title}
                            isCompleted={index < statusIndex}
                            isCurrent={index === statusIndex}
                        />
                    ))}
                </div>
            </div>
        </div>


        {/* Main Content: Token & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Token and OTP */}
            <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg shadow-orange-500/30 text-center flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white/90">Pickup Details</h3>
                    <p className="text-sm font-semibold text-white/80 uppercase">Your Token Number</p>
                    <p className="text-7xl font-extrabold text-white my-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>23</p>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/30"></div>
                        <span className="flex-shrink mx-4 text-white/90 text-xs font-semibold">Your OTP</span>
                        <div className="flex-grow border-t border-white/30"></div>
                    </div>

                    <p className="text-5xl font-bold text-white tracking-widest" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>2759</p>
                </div>
                <div className="mt-6 border-t border-white/30 pt-4 flex flex-col items-center">
                    <QrCode size={40} className="text-white/90 mb-2"/>
                    <p className="text-xs text-white/80">Show this OTP or scan the QR code at the counter.</p>
                </div>
            </div>

            {/* Right: Order Summary & Details */}
            <div className="bg-slate-50 p-6 rounded-lg border border-gray-200 flex flex-col">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Order Details</h3>
                <div className="flex-grow">
                    <div className="space-y-2 border-t border-b border-gray-200 py-2">
                        <OrderItem name="Samosa Chaat" quantity={2} />
                        <OrderItem name="Masala Dosa" quantity={1} />
                        <OrderItem name="Paneer Butter Masala Combo" quantity={1} />
                    </div>
                    <div className="flex justify-between font-bold text-lg my-4 text-gray-900">
                        <span>Total Paid</span>
                        <span>₹535.00</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-4">
                        <DetailRow icon={<Utensils size={20} className="text-gray-500 mt-0.5"/>} label="Dining Option" value="Dine In" />
                        <DetailRow icon={<Clock size={20} className="text-gray-500 mt-0.5"/>} label="Pickup Time" value="11:30 AM" />
                        <DetailRow icon={<MessageSquare size={20} className="text-gray-500 mt-0.5"/>} label="Special Instructions" value="Make it extra spicy." />
                    </div>
                </div>
                 <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                    <a href="#" className="text-sm font-semibold text-orange-600 hover:underline flex items-center justify-center gap-2">
                        <Info size={16} />
                        Need help with your order?
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          body { 
            font-family: 'Inter', sans-serif;
           }
        `}
      </style>
      <CanteenOrderTracker />
    </>
  );
}
