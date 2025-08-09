import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import FoodCategoriesCarousel from '../pages/user/CategoryList';
import RestaurantList from '../pages/user/RestaurantList';
import Header from '../pages/user/Header';
import TodaysSpecial from '../pages/user/TodaysSpecial';
import Footer from '../components/spectrumui/footer.jsx';
import CanteenHomeSection from '../pages/user/check.jsx';
import { Clock, Coffee, AlertCircle } from 'lucide-react';
import { getCanteenStatus } from '../lib/canteen-utils';

// Canteen Status Component
const CanteenStatus = () => {
  const [status, setStatus] = useState(getCanteenStatus());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getCanteenStatus());
      setCurrentTime(new Date());
    };

    // Update immediately
    updateStatus();
    
    // Update every minute
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <div className={`relative overflow-hidden rounded-2xl p-6 ${
        status.isOpen 
          ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg' 
          : 'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 shadow-lg'
      }`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              status.isOpen ? 'bg-emerald-400/20 text-emerald-100' : 'bg-gray-400/20 text-gray-100'
            }`}>
              {status.isOpen ? (
                <Coffee className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {status.isOpen ? 'Canteen is Open!' : 'Canteen is Closed'}
              </h2>
              <p className="text-white/90 font-medium">
                {status.timeUntil}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 text-white/90 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              status.isOpen 
                ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' 
                : 'bg-gray-400/20 text-gray-100 border border-gray-300/30'
            }`}>
              {status.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
            </div>
          </div>
        </div>
        
        {/* Hours Info */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>🕕 Opening Hours: {status.openTime} - {status.closeTime}</span>
            <span>📅 {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Session check component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const userSession = localStorage.getItem('user_session');
      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession);
          if (sessionData && sessionData.id) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error parsing session:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const UserDashboard = () => (
  <div className="bg-stone-50 min-h-screen font-sans flex flex-col">
    <Header />
    
    {/* Main Content Container */}
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 mt-32">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Canteen Status Section */}
        <CanteenStatus />
        
        {/* Section 1: Categories (Explore the Menu) */}
        <section className="mb-16">
          <FoodCategoriesCarousel />
        </section>

        {/* Section 2: Hot Picks of the Day */}
        <section className="mb-16">
          <TodaysSpecial />
        </section>

        {/* Section 3: All Menu Items */}
        <section className="mb-16">
          <RestaurantList />
        </section>

      </div>
    </div>
    
    <CanteenHomeSection />
    <Footer />
  </div>
);

export default UserDashboard; 