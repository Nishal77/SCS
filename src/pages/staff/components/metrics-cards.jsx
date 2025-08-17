import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Users, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import supabase from '@/lib/supabase';

const MetricsCards = () => {
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Orders',
      value: '0',
      decimal: '',
      range: 'This Month',
      icon: ShoppingCart,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      trend: '+0%',
      trendColor: 'text-gray-500',
      trendIcon: TrendingUp,
    },
    {
      title: 'Total Revenue',
      value: '₹0',
      decimal: '',
      range: 'This Month',
      icon: ArrowUpRight,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      trend: '+0%',
      trendColor: 'text-gray-500',
      trendIcon: TrendingUp,
    },
    {
      title: 'Active Orders',
      value: '0',
      decimal: '',
      range: 'Currently',
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      trend: '0',
      trendColor: 'text-gray-500',
      trendIcon: TrendingUp,
    },
    {
      title: 'Average Order Value',
      value: '₹0',
      decimal: '',
      range: 'This Month',
      icon: ArrowUpRight,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      trend: '+0%',
      trendColor: 'text-gray-500',
      trendIcon: TrendingUp,
    },
  ]);

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time subscription for metrics updates
    const subscription = supabase
      .channel('metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      // Get current month's date range
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Start of current month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Start of previous month for comparison
      const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
      startOfPreviousMonth.setHours(0, 0, 0, 0);
      
      // End of previous month
      const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);
      endOfPreviousMonth.setHours(23, 59, 59, 999);

      // Fetch current month's transactions
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', startOfMonth.toISOString());

      if (currentMonthError) throw currentMonthError;

      // Fetch previous month's transactions
      const { data: previousMonthData, error: previousMonthError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString());

      if (previousMonthError) throw previousMonthError;

      // Calculate MONTHLY stats instead of daily
      const currentMonthOrders = currentMonthData?.length || 0;
      const previousMonthOrders = previousMonthData?.length || 0;
      const currentMonthRevenue = currentMonthData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const previousMonthRevenue = previousMonthData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      
      // Calculate pending orders for current month
      const { data: pendingOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .in('order_status', ['Pending', 'Accepted', 'Cooking'])
        .gte('created_at', startOfMonth.toISOString());

      const pendingOrders = pendingOrdersData?.length || 0;
      
      // Calculate average order value for current month
      const avgOrderValue = currentMonthOrders > 0 ? currentMonthRevenue / currentMonthOrders : 0;

      // Calculate monthly trends (comparing current month vs previous month)
      const orderTrend = previousMonthOrders > 0 ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100).toFixed(1) : 0;
      const revenueTrend = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1) : 0;

      // Update metrics state
      setMetrics([
        {
          title: 'Total Orders',
          value: currentMonthOrders.toString(),
          decimal: '',
          range: 'This Month',
          icon: ShoppingCart,
          iconBg: 'bg-yellow-50',
          iconColor: 'text-yellow-500',
          trend: `${orderTrend >= 0 ? '+' : ''}${orderTrend}%`,
          trendColor: orderTrend >= 0 ? 'text-green-500' : 'text-red-500',
          trendIcon: orderTrend >= 0 ? TrendingUp : TrendingDown,
        },
        {
          title: 'Total Revenue',
          value: `₹${currentMonthRevenue.toFixed(0)}`,
          decimal: '',
          range: 'This Month',
          icon: ArrowUpRight,
          iconBg: 'bg-green-50',
          iconColor: 'text-green-500',
          trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`,
          trendColor: revenueTrend >= 0 ? 'text-green-500' : 'text-red-500',
          trendIcon: revenueTrend >= 0 ? TrendingUp : TrendingDown,
        },
        {
          title: 'Active Orders',
          value: pendingOrders.toString(),
          decimal: '',
          range: 'Currently',
          icon: Users,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-500',
          trend: pendingOrders.toString(),
          trendColor: 'text-blue-500',
          trendIcon: TrendingUp,
        },
        {
          title: 'Average Order Value',
          value: `₹${avgOrderValue.toFixed(0)}`,
          decimal: '',
          range: 'This Month',
          icon: ArrowUpRight,
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-500',
          trend: `₹${avgOrderValue.toFixed(0)}`,
          trendColor: 'text-purple-500',
          trendIcon: TrendingUp,
        },
      ]);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row flex-wrap gap-4 mt-2 mb-8">
      {metrics.map((metric, idx) => (
        <div
          key={metric.title}
          className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col justify-between min-w-[220px] max-w-[320px] relative overflow-hidden"
          style={{ flexBasis: '260px' }}
        >
          {/* Arrow/icon */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${metric.iconBg} border border-gray-200`}>
              <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
            </span>
          </div>
          {/* Title */}
          <div className="text-sm font-medium text-gray-500 mb-2">{metric.title}</div>
          {/* Value */}
          <div className="flex items-end mb-2">
            <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{metric.value}</span>
            {metric.decimal && <span className="text-xl md:text-2xl font-semibold text-gray-300 ml-1 mb-0.5">{metric.decimal}</span>}
          </div>
          {/* Trend */}
          <div className="flex items-center gap-2 mb-2">
            <metric.trendIcon size={16} className={metric.trendColor} />
            <span className={`text-sm font-medium ${metric.trendColor}`}>{metric.trend}</span>
          </div>
          {/* Date range */}
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">{metric.range}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards; 