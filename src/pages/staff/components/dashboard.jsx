import React, { useState, useEffect } from 'react';
import MetricsCards from './metrics-cards';
import TransactionPerformance from './transaction-performance';
import SalesPerformanceGauge from './performance/SalesPerformanceGauge';
import MostOrderedItems from './most-ordered-items';
import VisitorHeatmap from './visitor-heatmap';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="p-6">
      {/* Header with Date/Time */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your canteen this month.</p>
        </div>
        
        {/* Live Date/Time Display */}
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-800">
            {formatDate(currentTime)}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-500">
            Live Time
          </div>
        </div>
      </div>

            {/* Metrics Cards */}
            <MetricsCards />

            {/* Transaction Performance */}
            <TransactionPerformance />

           

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MostOrderedItems />
                <VisitorHeatmap />
            </div>
        </div>
    );
};

export default Dashboard; 