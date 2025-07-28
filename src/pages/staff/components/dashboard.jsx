import React from 'react';
import { Star, TrendingUp, Users, Clock, Package, DollarSign, ShoppingCart, UserCheck } from 'lucide-react';
import MetricsCards from './metrics-cards';
import TransactionPerformance from './transaction-performance';
import SalesPerformanceGauge from './performance/SalesPerformanceGauge';
import MostOrderedItems from './most-ordered-items';
import VisitorHeatmap from './visitor-heatmap';

const Dashboard = () => {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your canteen today.</p>
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