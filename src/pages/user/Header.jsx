import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, ChevronDown, Menu, X, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';

// Custom Hook to fetch user's location (city)
const useLocation = () => {
    const [location, setLocation] = useState({
        city: null,
        countryCode: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(loc => ({
                ...loc,
                loading: false,
                error: "Geolocation is not supported by your browser."
            }));
            return;
        }

        const successHandler = async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Using OpenStreetMap's free reverse geocoding API
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch location data.');
                }
                const data = await response.json();
                
                // Find the city from the address details, with fallbacks
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || "Unknown City";
                const countryCode = data.address.country_code ? data.address.country_code.toUpperCase() : 'N/A';

                setLocation({
                    city,
                    countryCode,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                setLocation({
                    city: null,
                    countryCode: null,
                    loading: false,
                    error: "Could not fetch city name."
                });
            }
        };

        const errorHandler = (error) => {
            let errorMessage = "An unknown error occurred.";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "The request to get user location timed out.";
                    break;
                default:
                    errorMessage = "An unknown error occurred.";
            }
            setLocation({
                city: null,
                countryCode: null,
                loading: false,
                error: errorMessage,
            });
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

    }, []); // Empty dependency array ensures this runs only once on mount

    return location;
};


// --- Header Component with Geolocation ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { city, countryCode, loading, error } = useLocation();

    // Reusable Logo Component
    const Logo = () => (
        <Link to="/user/dashboard" className="relative flex items-center justify-center w-24 h-16 group cursor-pointer">
            <span className="absolute top-0 text-[10px] font-bold text-gray-500 tracking-widest uppercase group-hover:text-amber-500 transition-colors">moodbidri</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-amber-500 transition-colors">.MITE.</h1>
            <span className="absolute bottom-0 text-[10px] font-bold text-gray-500 tracking-widest uppercase group-hover:text-amber-500 transition-colors">EAT</span>
        </Link>
    );

    // Reusable NavLink components for different contexts
    const LocationLink = ({ compact = false }) => (
        <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200/80 rounded-lg px-3 py-2 hover:bg-gray-100/50">
            <MapPin className="w-4 h-4 text-gray-400"/>
            <p className="font-semibold flex items-center text-sm">
                {loading ? "Fetching..." : (error || city || "Set Location")}
            </p>
        </a>
    );

    const ProfileLink = ({ compact = false }) => (
        <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-2 py-2">
            <Avatar className="w-6 h-6">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>N</AvatarFallback>
            </Avatar>
            <p className="font-semibold flex items-center text-sm">
                Nishal N poojary
               
            </p>
        </a>
    );

    return (
        <header className="fixed top-0 lg:top-4 left-0 right-0 z-50 px-0 lg:px-4">
            <div className="container mx-auto p-2 lg:bg-white/70 lg:backdrop-blur-xl lg:rounded-2xl lg:shadow-xl lg:border lg:border-white/20 bg-white shadow-md">
                
                {/* Mobile & Tablet Header */}
                <div className="flex items-center justify-between lg:hidden">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-2">
                           <LocationLink compact />
                           <ProfileLink compact />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative flex items-center gap-3 px-4 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm shadow-md hover:bg-gray-800 transition-all">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white/80">3</span>
                        </button>
                        <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-3 items-center">
                    <nav className="flex items-center gap-4 text-md font-semibold">
                        <LocationLink />
                        <ProfileLink />
                    </nav>
                    <div className="flex items-center justify-center gap-8">
                        <Link to="/user/dashboard" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Menu</Link>
                        <Logo />
                        <Link to="/user/contact" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                         <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm hover:bg-gray-200/50 transition-all">
                            <LogIn className="w-5 h-5" />
                            Login
                        </a>
                        <button className="relative flex items-center gap-3 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm shadow-md hover:bg-gray-800 transform hover:scale-105 transition-all duration-300">
                            <ShoppingCart className="w-5 h-5" />
                            <span>My Cart</span>
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white/80">3</span>
                        </button>
                    </div>
                </div>

                 {/* Mobile Menu Dropdown */}
                 {isMenuOpen && (
                    <div className="lg:hidden mt-4 border-t border-gray-200/50 pt-4 flex flex-col items-center gap-4 text-md font-semibold">
                        <Link to="/user/dashboard" className="text-gray-800">Menu</Link>
                        <Link to="/user/contact" className="text-gray-800">Contact</Link>
                        <div className="sm:hidden flex flex-col items-center gap-4 pt-4 border-t border-gray-200/50 w-full">
                           <LocationLink />
                           <ProfileLink />
                        </div>
                         <a href="#" className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm bg-gray-200/50 transition-all w-full max-w-xs">
                            <LogIn className="w-5 h-5" />
                            Login
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

// Main App component to render the Header
export default function App() {
    return (
        <div className="">
            <Header />
        </div>
    );
}
