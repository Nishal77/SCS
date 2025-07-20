import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, ChevronDown, Clock, CreditCard, Home, Landmark, Minus, Plus, ShoppingCart, User, Wallet, MessageSquare, Tag } from 'lucide-react';

// --- Helper Function to Generate Time Slots ---
const generateTimeSlots = () => {
  const slots = [];
  const now = new Date();
  let currentHour = now.getHours();
  let currentMinute = now.getMinutes();

  // Canteen opens at 7:00 AM
  const startHour = 7;
  const startMinute = 0;
  // Canteen closes at 7:30 PM (19:30)
  const endHour = 19;
  const endMinute = 30;

  // If current time is before opening, start from opening
  if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
    currentHour = startHour;
    currentMinute = startMinute;
  }

  // Round up to the next 15-minute interval
  if (currentMinute > 0 && currentMinute <= 15) currentMinute = 15;
  else if (currentMinute > 15 && currentMinute <= 30) currentMinute = 30;
  else if (currentMinute > 30 && currentMinute <= 45) currentMinute = 45;
  else if (currentMinute > 45) {
    currentMinute = 0;
    currentHour += 1;
  }

  // If current time is after closing, return empty array
  if (currentHour > endHour || (currentHour === endHour && currentMinute > endMinute)) {
    return [];
  }

  // Generate slots from current time up to 7:30 PM
  while (
    currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
    const displayMinute = currentMinute.toString().padStart(2, '0');
    slots.push(`${displayHour}:${displayMinute} ${period}`);

    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  return slots;
};


// --- Mock Data for Cart Items (Indian Dishes) ---
const initialCartItems = [
  {
    id: 1,
    name: 'Samosa Chaat',
    image: 'https://placehold.co/100x100/f97316/white?text=Samosa',
    price: 80,
    quantity: 2,
  },
  {
    id: 2,
    name: 'Masala Dosa',
    image: 'https://placehold.co/100x100/fbbf24/white?text=Dosa',
    price: 120,
    quantity: 1,
  },
  {
    id: 3,
    name: 'Paneer Butter Masala Combo',
    image: 'https://placehold.co/100x100/ef4444/white?text=Paneer',
    price: 250,
    quantity: 1,
  },
];

// --- Reusable Components ---

const OrderItem = ({ item, onQuantityChange }) => (
  <div className="flex items-center gap-3 py-3">
    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
    <div className="flex-grow">
      <p className="font-semibold text-sm text-gray-800">{item.name}</p>
      <p className="text-xs text-gray-500">₹{item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center gap-2 border border-gray-200 rounded-full py-0.5 px-1">
      <button onClick={() => onQuantityChange(item.id, -1)} className="p-1 rounded-full hover:bg-gray-100">
        <Minus size={12} className="text-gray-600" />
      </button>
      <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
      <button onClick={() => onQuantityChange(item.id, 1)} className="p-1 rounded-full hover:bg-gray-100">
        <Plus size={12} className="text-gray-600" />
      </button>
    </div>
  </div>
);

const DiningOption = ({ icon, title, description, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
      selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    {icon}
    <div>
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {selected && <CheckCircle size={20} className="ml-auto text-orange-500" />}
  </div>
);

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm">
        <h2 className="text-md font-bold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);


// --- Main Cart Component ---
const SmartCanteenCart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [diningOption, setDiningOption] = useState('dine-in');
  const [pickupTime, setPickupTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
    if (slots.length > 0) {
      setPickupTime(slots[0]);
    }
  }, []);

  const handleQuantityChange = (itemId, change) => {
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = 25.00;
  const grabGoFee = diningOption === 'grab-and-go' ? 10.00 : 0;
  const discount = 50.00;
  const total = subtotal + serviceFee + grabGoFee - discount;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="text-gray-700" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Your Canteen Cart</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            
            <SectionCard title="Your Details">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                    <Avatar className="w-6 h-6">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>N</AvatarFallback>
            </Avatar>
                        <div>
                            <p className="font-semibold text-sm text-gray-800">Nishal N Poojary</p>
                            <p className="text-xs text-gray-500">2024mca039@mite.ac.in</p>
                        </div>
                    </div>
                    <button className="font-semibold text-xs text-orange-600 hover:underline">Change</button>
                </div>
            </SectionCard>

            <SectionCard title="Dining & Pickup Options">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DiningOption
                  icon={<Home size={24} className="text-orange-500" />}
                  title="Dine In"
                  description="Enjoy your meal at our canteen."
                  selected={diningOption === 'dine-in'}
                  onClick={() => setDiningOption('dine-in')}
                />
                <DiningOption
                  icon={<ShoppingCart size={24} className="text-orange-500" />}
                  title="Grab & Go"
                  description="Quickly pick up your order."
                  selected={diningOption === 'grab-and-go'}
                  onClick={() => setDiningOption('grab-and-go')}
                />
              </div>
              <div className="relative">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Pickup Time</label>
                  {timeSlots.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-semibold bg-red-50 border border-red-200 rounded-md px-4 py-3 mt-2">
                      <Clock size={16} className="text-red-400" />
                      Canteen is closed for pickups.
                    </div>
                  ) : (
                    <>
                      <Clock className="absolute left-3 top-9 text-gray-400" size={16} />
                      <select 
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full text-sm pl-9 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                          {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-9 text-gray-400" size={16} />
                    </>
                  )}
              </div>
            </SectionCard>
            
            <SectionCard title="Special Instructions">
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g., Make it less spicy, no onions..."
                        className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        rows="3"
                    ></textarea>
                </div>
            </SectionCard>

            <SectionCard title="Payment Method">
                <div className="space-y-3">
                    {['Cash Payment', 'Online payemnet', 'Debit / Credit Card'].map((method, index) => (
                        <label key={method} className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer ${index > 0 ? 'opacity-70' : 'border-orange-500 bg-orange-50'}`}>
                            {index === 0 && <CreditCard size={20} className="text-gray-700"/>}
                            {index === 1 && <Landmark size={20} className="text-gray-700"/>}
                            {index === 2 && <Wallet size={20} className="text-gray-700"/>}
                            <span className="font-semibold text-sm flex-grow">{method}</span>
                            <input type="radio" name="payment" defaultChecked={index === 0} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                        </label>
                    ))}
                </div>
            </SectionCard>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm h-fit sticky top-6">
            <h2 className="text-md font-bold text-gray-800 border-b pb-3 mb-3">Order Summary</h2>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <OrderItem key={item.id} item={item} onQuantityChange={handleQuantityChange} />
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
                <label className="text-xs font-medium text-gray-600 mb-2 block">Apply Coupon</label>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="MITE20" className="w-full text-sm pl-9 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <button className="bg-gray-200 text-gray-700 font-bold text-sm py-2 px-4 rounded-md hover:bg-gray-300">Apply</button>
                </div>
            </div>

            <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-600">
              <dl className="space-y-2">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium text-gray-800">₹{subtotal.toFixed(2)}</dd></div>
                  <div className="flex justify-between"><dt>Service Fee</dt><dd className="font-medium text-gray-800">₹{serviceFee.toFixed(2)}</dd></div>
                  {diningOption === 'grab-and-go' && (
                    <div className="flex justify-between text-orange-600"><dt>Grab & Go Charge</dt><dd className="font-medium">+₹10.00</dd></div>
                  )}
                  <div className="flex justify-between text-green-600"><dt>Discount</dt><dd className="font-medium">-₹{discount.toFixed(2)}</dd></div>
              </dl>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center text-md font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full mt-5 bg-black text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
              Pay ₹{total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pt-24 pb-8">
        <SmartCanteenCart />
      </main>
      <Footer />
    </div>
  );
}
