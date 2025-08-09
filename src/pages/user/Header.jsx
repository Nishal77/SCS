import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, Truck, ChevronDown, Menu, X, LogOut, LogIn, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';



// --- Header Component with Live Location ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userSession, setUserSession] = useState(null);
    const navigate = useNavigate();

    // Get user session data
    useEffect(() => {
        const session = localStorage.getItem('user_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                setUserSession(sessionData);
            } catch (error) {
                console.error('Error parsing user session:', error);
            }
        }
    }, []);

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Clear custom user session from localStorage
            localStorage.removeItem('user_session');
            
            // Also clear any Supabase session if it exists
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Supabase logout error:', error);
            }
            
            // Clear user session state
            setUserSession(null);
            
            // Redirect to user dashboard
            navigate('/user/dashboard');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Reusable Logo Component
    const Logo = () => (
        <Link to="/user/dashboard" className="relative flex items-center justify-center w-24 h-16 group cursor-pointer">
            <span className="absolute top-0 text-[10px] font-bold text-gray-500 tracking-widest uppercase group-hover:text-amber-500 transition-colors">moodbidri</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-amber-500 transition-colors">.MITE.</h1>
            <span className="absolute bottom-0 text-[10px] font-bold text-gray-500 tracking-widest uppercase group-hover:text-amber-500 transition-colors">EAT</span>
        </Link>
    );

    // Simple Location Display Component using only navigator.geolocation
    const LocationDisplay = ({ compact = false }) => {
        const [coords, setCoords] = useState(null);
        const [address, setAddress] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        // Function to get address from coordinates using reverse geocoding
        const getAddressFromCoords = async (latitude, longitude) => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                );
                const data = await response.json();
                
                if (data.display_name) {
                    // Extract the most relevant parts of the address and filter out pincodes
                    const addressParts = data.display_name.split(', ');
                    let displayAddress = '';
                    
                    // Filter out pincodes (6-digit numbers) and get only the place name
                    const filteredParts = addressParts.filter(part => !/^\d{6}$/.test(part.trim()));
                    
                    if (filteredParts.length >= 1) {
                        displayAddress = filteredParts[0];
                    } else {
                        displayAddress = data.display_name;
                    }
                    
                    setAddress(displayAddress);
                }
            } catch (err) {
                console.error('Error getting address:', err);
                // If reverse geocoding fails, we'll still show coordinates
            }
        };

        const getLocation = () => {
            if (navigator.geolocation) {
                setLoading(true);
                setError(null);
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoords({ latitude, longitude });
                        setLoading(false);
                        console.log('Location obtained:', { latitude, longitude });
                        
                        // Get address from coordinates
                        getAddressFromCoords(latitude, longitude);
                    },
                    (error) => {
                        setError("Unable to fetch location: " + error.message);
                        setLoading(false);
                        console.error('Location error:', error);
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
            }
        };

        // Get location on component mount
        useEffect(() => {
            getLocation();
        }, []);
        
        return (
            <div className={`flex items-center gap-2 sm:gap-3 text-gray-600 border border-gray-200/80 rounded-lg ${
                compact 
                    ? 'px-2 sm:px-3 py-2 sm:py-2.5' 
                    : 'px-4 py-3'
            }`}>
                <MapPin className={`w-4 h-4 text-gray-400 ${
                    compact ? 'sm:w-5 sm:h-5' : 'w-5 h-5'
                }`}/>
                <div className="flex flex-col min-w-0">
                    {loading ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className={`w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin ${
                                compact ? 'sm:w-4 sm:h-4' : 'w-4 h-4'
                            }`}></div>
                            <span className={`font-medium text-gray-600 ${
                                compact ? 'text-sm sm:text-base' : 'text-base'
                            }`}>Getting location...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <span className={`text-red-500 font-medium ${
                                compact ? 'text-sm sm:text-base' : 'text-base'
                            }`}>{error}</span>
                            <button 
                                onClick={getLocation}
                                className={`text-blue-600 hover:text-blue-800 font-semibold hover:underline ${
                                    compact ? 'text-sm sm:text-base' : 'text-base'
                                }`}
                            >
                                Retry
                            </button>
                        </div>
                    ) : coords ? (
                        <div className="flex flex-col">
                            {address ? (
                                <span className={`font-semibold text-gray-800 leading-tight ${
                                    compact ? 'text-base sm:text-lg' : 'text-lg'
                                }`}>
                                    {address}
                                </span>
                            ) : (
                                <span className={`font-medium text-gray-600 ${
                                    compact ? 'text-sm sm:text-base' : 'text-base'
                                }`}>
                                    {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <span className={`font-medium text-gray-600 ${
                                compact ? 'text-sm sm:text-base' : 'text-base'
                            }`}>Location</span>
                            <button 
                                onClick={getLocation}
                                className={`text-blue-600 hover:text-blue-800 font-semibold hover:underline ${
                                    compact ? 'text-sm sm:text-base' : 'text-base'
                                }`}
                            >
                                Enable
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProfileLink = ({ compact = false }) => (
        <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-2 py-2">
            <Avatar className="w-6 h-6">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>{userSession?.email_name ? userSession.email_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <p className="font-semibold flex items-center text-sm">
                {userSession?.email_name || 'User'}
            </p>
        </a>
    );

    const LoginButton = () => (
        <Link to="/auth/login" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition-all">
            <LogIn className="w-5 h-5" />
            Login
        </Link>
    );

    return (
        <header className="fixed top-0 lg:top-4 left-0 right-0 z-50 px-0 lg:px-4">
            <div className="container mx-auto p-2 lg:bg-white/70 lg:backdrop-blur-xl lg:rounded-2xl lg:shadow-xl lg:border lg:border-white/20 bg-white shadow-md">
                
                {/* Mobile & Tablet Header */}
                <div className="flex items-center justify-between lg:hidden">
                                    <div className="flex items-center gap-4">
                    <Logo />
                    <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-2">
                       <LocationDisplay compact />
                       {userSession && <ProfileLink compact />}
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
                        <LocationDisplay />
                        {userSession && <ProfileLink />}
                    </nav>
                    <div className="flex items-center justify-center gap-8">
                        <Link to="/user/dashboard" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Menu</Link>
                        <Logo />
                        <Link to="/user/contact" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        {userSession ? (
                            <>
                                <button 
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                                <Link to="/user/cart" className="relative text-gray-600 hover:text-orange-500 mr-3">
                                    <ShoppingCart className="w-6 h-6" />
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">3</span>
                                </Link>
                                <Link to="/user/order" className="relative flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm shadow-md hover:bg-gray-800 transform hover:scale-105 transition-all duration-300">
                                    <Truck className="w-5 h-5" />
                                    <span>Orders</span>
                                </Link>
                            </>
                        ) : (
                            <LoginButton />
                        )}
                    </div>
                </div>

                 {/* Mobile Menu Dropdown */}
                 {isMenuOpen && (
                    <div className="lg:hidden mt-4 border-t border-gray-200/50 pt-4 flex flex-col items-center gap-4 text-md font-semibold">
                        <Link to="/user/dashboard" className="text-gray-800">Menu</Link>
                        <Link to="/user/contact" className="text-gray-800">Contact</Link>
                        <div className="sm:hidden flex flex-col items-center gap-4 pt-4 border-t border-gray-200/50 w-full">
                           <LocationDisplay />
                           {userSession && <ProfileLink />}
                        </div>
                        {userSession ? (
                            <button 
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm bg-red-100 hover:bg-red-200 hover:text-red-600 transition-all w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <LogOut className="w-5 h-5" />
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        ) : (
                            <Link to="/auth/login" className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-gray-700 font-bold rounded-full text-sm bg-blue-100 hover:bg-blue-200 hover:text-blue-600 transition-all w-full max-w-xs">
                                <LogIn className="w-5 h-5" />
                                Login
                            </Link>
                        )}
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
 