import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Users, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import supabase from '@/lib/supabase';

const MetricsCards = () => {
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Orders',
      value: '0',
      decimal: '',
      range: 'Today',
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
      range: 'Today',
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
      range: 'Today',
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
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Fetch today's transactions
      const { data: todayData, error: todayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;

      // Fetch yesterday's transactions
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (yesterdayError) throw yesterdayError;

      // Calculate metrics
      const todayOrders = todayData?.length || 0;
      const yesterdayOrders = yesterdayData?.length || 0;
      const todayRevenue = todayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayData?.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0) || 0;
      
      // Calculate active orders (orders with status 'Pending', 'Accepted', 'Preparing')
      const { data: activeOrdersData } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .in('order_status', ['Pending', 'Accepted', 'Preparing']);

      const activeOrders = activeOrdersData?.length || 0;
      
      // Calculate average order value
      const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

      // Calculate trends
      const orderTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) : 0;
      const revenueTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;

      // Update metrics state
      setMetrics([
        {
          title: 'Total Orders',
          value: todayOrders.toString(),
          decimal: '',
          range: 'Today',
          icon: ShoppingCart,
          iconBg: 'bg-yellow-50',
          iconColor: 'text-yellow-500',
          trend: `${orderTrend >= 0 ? '+' : ''}${orderTrend}%`,
          trendColor: orderTrend >= 0 ? 'text-green-500' : 'text-red-500',
          trendIcon: orderTrend >= 0 ? TrendingUp : TrendingDown,
        },
        {
          title: 'Total Revenue',
          value: `₹${todayRevenue.toFixed(0)}`,
          decimal: '',
          range: 'Today',
          icon: ArrowUpRight,
          iconBg: 'bg-green-50',
          iconColor: 'text-green-500',
          trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`,
          trendColor: revenueTrend >= 0 ? 'text-green-500' : 'text-red-500',
          trendIcon: revenueTrend >= 0 ? TrendingUp : TrendingDown,
        },
        {
          title: 'Active Orders',
          value: activeOrders.toString(),
          decimal: '',
          range: 'Currently',
          icon: Users,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-500',
          trend: activeOrders.toString(),
          trendColor: 'text-blue-500',
          trendIcon: TrendingUp,
        },
        {
          title: 'Average Order Value',
          value: `₹${avgOrderValue.toFixed(0)}`,
          decimal: '',
          range: 'Today',
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