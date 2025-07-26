import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import FoodCategoriesCarousel from '../pages/user/CategoryList';
import RestaurantList from '../pages/user/RestaurantList';
import Header from '../pages/user/Header';
import TodaysSpecial from '../pages/user/TodaysSpecial';
import HeroSection from '../pages/user/Hero';
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
  <ProtectedRoute>
    <div className="bg-stone-50 min-h-screen font-sans flex flex-col">
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <FoodCategoriesCarousel />
          <TodaysSpecial />
          <RestaurantList />
        </div>
      </div>
      <CanteenHomeSection />
      <Footer />
    </div>
  </ProtectedRoute>
);

export default UserDashboard; 