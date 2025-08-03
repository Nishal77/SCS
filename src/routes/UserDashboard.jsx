import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import FoodCategoriesCarousel from '../pages/user/CategoryList';
import RestaurantList from '../pages/user/RestaurantList';
import Header from '../pages/user/Header';
import TodaysSpecial from '../pages/user/TodaysSpecial';
import Footer from '../components/spectrumui/footer.jsx';
import CanteenHomeSection from '../pages/user/check.jsx';

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Section 1: Categories (Explore the Menu) */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore the Menu</h2>
            <p className="text-gray-600">Browse by categories to find your favorite dishes</p>
          </div>
          <FoodCategoriesCarousel />
        </section>

        {/* Section 2: Hot Picks of the Day */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hot Picks of the Day</h2>
            <p className="text-gray-600">Today's most popular and trending items</p>
          </div>
          <TodaysSpecial />
        </section>

        {/* Section 3: All Menu Items */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Menu</h2>
            <p className="text-gray-600">Explore our full menu with all available dishes</p>
          </div>
          <RestaurantList />
        </section>

      </div>
    </div>
    
    <CanteenHomeSection />
    <Footer />
  </div>
);

export default UserDashboard; 