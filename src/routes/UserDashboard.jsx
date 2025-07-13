import React from 'react';
import FoodCategoriesCarousel from '../pages/user/CategoryList';
import RestaurantList from '../pages/user/RestaurantList';
import Header from '../pages/user/Header';
import TodaysSpecial from '../pages/user/TodaysSpecial';
import HeroSection from '../pages/user/Hero';

const UserDashboard = () => (
  <div className="bg-stone-50 min-h-screen font-sans">
    <Header />
    <HeroSection />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FoodCategoriesCarousel />
        <TodaysSpecial />
        <RestaurantList />
      </div>
    </div>
  </div>
);

export default UserDashboard; 