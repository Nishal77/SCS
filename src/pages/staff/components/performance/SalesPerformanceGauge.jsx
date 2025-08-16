import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import supabase from '@/lib/supabase';

export default function SalesPerformanceGauge() {
  const [period, setPeriod] = useState("Day");
  const [performanceData, setPerformanceData] = useState({
    Day: 0,
    Week: 0,
    Month: 0,
    loading: true
  });

  useEffect(() => {
    fetchPerformanceData();
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('sales_performance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchPerformanceData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setPerformanceData(prev => ({ ...prev, loading: true }));
      
      const currentDate = new Date();
      
      // Calculate date ranges
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - 7);
      
      const monthStart = new Date(currentDate);
      monthStart.setMonth(monthStart.getMonth() - 1);
      
      // Get transactions for each period
      const { data: dayTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', dayStart.toISOString());
      
      const { data: weekTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', weekStart.toISOString());
      
      const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success')
        .gte('created_at', monthStart.toISOString());
      
      // Calculate performance percentages based on target goals
      const dayGoal = 10; // Target 10 orders per day
      const weekGoal = 70; // Target 70 orders per week
      const monthGoal = 300; // Target 300 orders per month
      
      const dayPerformance = Math.min((dayTransactions?.length || 0) / dayGoal * 100, 100);
      const weekPerformance = Math.min((weekTransactions?.length || 0) / weekGoal * 100, 100);
      const monthPerformance = Math.min((monthTransactions?.length || 0) / monthGoal * 100, 100);
      
      setPerformanceData({
        Day: Math.round(dayPerformance),
        Week: Math.round(weekPerformance),
        Month: Math.round(monthPerformance),
        loading: false
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData(prev => ({ ...prev, loading: false }));
    }
  };

  const value = performanceData[period];

  // Create data for the pie chart to simulate a gauge
  const data = [
    { name: 'value', value: value, fill: '#f97316' }, // Orange for the value
    { name: 'remaining', value: 100 - value, fill: '#f3f4f6' } // Gray for remaining
  ];

  return (
    <div className="flex flex-col items-center w-full" style={{marginBottom: 0, paddingBottom: 0}}>
      <div className="flex gap-2 mb-4">
        {Object.keys(performanceData).filter(key => key !== 'loading').map((label) => (
          <button
            key={label}
            onClick={() => setPeriod(label)}
            className={`px-3 py-1 rounded-full font-semibold text-xs transition-all border border-gray-200 focus:outline-none ${
              period === label
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-200"
            }`}
            style={{marginBottom: 0, letterSpacing: '0.02em'}}
          >
            {label}
          </button>
        ))}
      </div>
      
      {performanceData.loading ? (
        <div className="flex justify-center items-center w-full h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="relative flex justify-center items-center w-full" style={{marginBottom: 0, paddingBottom: 0}}>
          <ResponsiveContainer width={300} height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text showing the value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">{value}%</div>
            <div className="text-sm text-gray-500 mt-1">Performance</div>
          </div>
        </div>
      )}
    </div>
  );
} 