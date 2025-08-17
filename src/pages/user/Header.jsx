import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, Truck, ChevronDown, Menu, X, LogOut, LogIn, RefreshCw, Coffee, AlertCircle, User, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';
import { useCart } from '../../lib/cart-context';

import { generateAvatarFromEmail, generateInitials, getDisplayName, getDisplayEmail } from '../../lib/avatar-utils';

// Custom CSS for profile images with yellow border
const profileImageStyles = `
  .profile-avatar {
    position: relative;
    overflow: hidden;
  }
  
  .profile-avatar img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
  
  .profile-avatar .avatar-fallback {
    display: none;
  }
  
`;



// Profile Dropdown Component
const ProfileDropdown = ({ userSession, onLogout, isLoggingOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.profile-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Get display information from user session
  const displayName = getDisplayName(userSession);
  const displayEmail = getDisplayEmail(userSession);
          const avatarUrl = '/profile1.jpeg';
        const initials = generateInitials(displayEmail, displayName);

  return (
    <div className="relative profile-dropdown">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-full"
      >
        <Avatar className="w-10 h-10 border-2 border-black/30 overflow-hidden profile-avatar">
          <AvatarImage 
            src={avatarUrl} 
            alt={displayName}
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-amber-400 overflow-hidden profile-avatar">
                <AvatarImage 
                  src="/profile1.jpeg" 
                  alt={displayName}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Manage Account Section */}
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Account
              </h3>
              
              <Link
                to="/user/profile"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <User className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manage Account</p>
                  <p className="text-xs text-gray-500">Profile settings and preferences</p>
                </div>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-3 mx-4"></div>

            {/* Logout Section */}
            <div className="px-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{isLoggingOut ? 'Logging out...' : 'Sign out'}</p>
                  <p className="text-xs text-red-500">End your current session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Header Component with Live Location ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userSession, setUserSession] = useState(null);
    const navigate = useNavigate();
    const { cartCount } = useCart();

    // Add CSS to document head for perfect profile images
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = profileImageStyles;
        document.head.appendChild(style);
        
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

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
                // Try multiple geocoding services with fallbacks
                const services = [
                    // Service 1: OpenStreetMap Nominatim (with proper headers)
                    async () => {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'MITE-Canteen-App/1.0'
                                }
                            }
                        );
                        if (!response.ok) throw new Error('Nominatim service unavailable');
                        return await response.json();
                    },
                    // Service 2: BigDataCloud API (free tier, no CORS issues)
                    async () => {
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        if (!response.ok) throw new Error('BigDataCloud service unavailable');
                        return await response.json();
                    },
                    // Service 3: Fallback to coordinates
                    async () => {
                        return { display_name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` };
                    }
                ];

                let data = null;
                let lastError = null;

                // Try each service until one works
                for (const service of services) {
                    try {
                        data = await service();
                        break; // If successful, break out of the loop
                    } catch (err) {
                        lastError = err;
                        console.warn('Geocoding service failed:', err.message);
                        continue; // Try next service
                    }
                }

                if (data && data.display_name) {
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
                } else {
                    // Fallback to coordinates if no address found
                    setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
            } catch (err) {
                console.error('Error getting address:', err);
                // Fallback to coordinates if all services fail
                setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        };

        // Simple location display without external geocoding (avoids CORS issues)
        const getSimpleLocation = () => {
            setLoading(true);
            setError(null);
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoords({ latitude, longitude });
                        
                        // Simple location detection based on coordinates
                        // MITE Campus coordinates (approximate): 13.2743, 74.7599
                        const miteLat = 13.2743;
                        const miteLon = 74.7599;
                        const distance = Math.sqrt(
                            Math.pow(latitude - miteLat, 2) + Math.pow(longitude - miteLon, 2)
                        );
                        
                        if (distance < 0.01) { // Within ~1km of MITE campus
                            setAddress('MITE Campus');
                        } else if (distance < 0.05) { // Within ~5km
                            setAddress('Near MITE Campus');
                        } else {
                            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                        
                        setLoading(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        setError('Location access denied');
                        setLoading(false);
                        // Set a default location for MITE campus
                        setAddress('MITE Campus, Moodbidri');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            } else {
                setError('Geolocation not supported');
                setLoading(false);
                // Set a default location for MITE campus
                setAddress('MITE Campus, Moodbidri');
            }
        };

        const getLocation = () => {
            // Use simple location detection to avoid CORS issues
            getSimpleLocation();
        };

        useEffect(() => {
            getLocation();
        }, []);

        if (compact) {
            return (
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">
                        {loading ? 'Getting location...' : address || 'MITE Campus' || 'Location'}
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                    {loading ? 'Getting location...' : address || 'MITE Campus'}
                </span>
            </div>
        );
    };

    // Profile Link Component (for mobile)
    const ProfileLink = ({ compact = false }) => {
        // Get display information from user session
        const displayName = getDisplayName(userSession);
        const displayEmail = getDisplayEmail(userSession);
        const avatarUrl = '/profile.JPG';
        const initials = generateInitials(displayEmail, displayName);

        return (
            <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border-2 border-amber-400 overflow-hidden profile-avatar">
                <AvatarImage 
                    src={avatarUrl} 
                    alt={displayName}
                    className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-sm">
                    {initials}
                </AvatarFallback>
            </Avatar>
                {!compact && (
                    <span className="text-sm font-medium text-gray-700">
                        {displayName}
                    </span>
                )}
            </div>
        );
    };

    // Login Button Component
    const LoginButton = () => (
        <Link to="/auth/login" className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-bold rounded-full text-sm shadow-md hover:bg-amber-600 transform hover:scale-105 transition-all duration-300">
            <LogIn className="w-4 h-4" />
            <span>Login</span>
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
                        <Link to="/user/cart" className="relative flex items-center gap-3 px-4 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm shadow-md hover:bg-gray-800 transition-all">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white/80">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-3 items-center">
                    <nav className="flex items-center gap-4 text-md font-semibold">
                        <LocationDisplay />
                    </nav>
                    
                    <div className="flex items-center justify-center gap-8">
                        <Link to="/user/dashboard" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Menu</Link>
                        <Logo />
                        <Link to="/user/contact" className="text-gray-800 font-semibold hover:text-amber-500 transition-colors">Contact</Link>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1">
                        {userSession ? (
                            <>
                                <Link to="/user/cart" className="relative text-gray-600 hover:text-orange-500 transition-colors mr-2">
                                    <ShoppingCart className="w-6 h-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                                
                                <Link to="/user/orders" className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm shadow-md hover:bg-gray-800 transform  duration-300">
                                    <Truck className="w-5 h-5" />
                                    <span>Orders</span>
                                </Link>
                                
                                <ProfileDropdown 
                                    userSession={userSession} 
                                    onLogout={handleLogout} 
                                    isLoggingOut={isLoggingOut}
                                />
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
 