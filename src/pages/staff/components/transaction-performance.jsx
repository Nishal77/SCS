import React, { useState, useEffect } from 'react';
import SalesPerformanceGauge from './performance/SalesPerformanceGauge';
import supabase from '@/lib/supabase';

const TransactionPerformance = () => {
  const [transactionData, setTransactionData] = useState({
    totalTransactions: 0,
    successTransactions: 0,
    monthlyData: [],
    loading: true
  });

  useEffect(() => {
    fetchTransactionData();
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('transaction_performance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchTransactionData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTransactionData = async () => {
    try {
      setTransactionData(prev => ({ ...prev, loading: true }));
      
      // Get all transactions
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('*');

      if (allError) throw allError;

      // Get successful transactions
      const { data: successTransactions, error: successError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_status', 'success');

      if (successError) throw successError;

      // Calculate monthly data for the last 6 months
      const monthlyData = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthTransactions = successTransactions.filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });
        
        const monthRevenue = monthTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
        
        monthlyData.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
          transactions: monthTransactions.length
        });
      }

      setTransactionData({
        totalTransactions: allTransactions?.length || 0,
        successTransactions: successTransactions?.length || 0,
        monthlyData,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setTransactionData(prev => ({ ...prev, loading: false }));
    }
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...transactionData.monthlyData.map(m => m.revenue), 1);
  const avgRevenue = transactionData.monthlyData.reduce((sum, m) => sum + m.revenue, 0) / transactionData.monthlyData.length || 0;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 mb-8">
      {/* Transaction Activity Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col lg:col-span-2 min-w-[320px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold text-gray-900">Transaction Activity</div>
          <button className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">Last 6 Months</button>
        </div>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{transactionData.successTransactions}</span>
          <span className="text-xl md:text-2xl font-semibold text-gray-300 mb-0.5">transactions</span>
        </div>
        
        {transactionData.loading ? (
          <div className="w-full h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="w-full h-32 flex items-end mt-2 relative">
              {/* Y axis labels */}
              <div className="absolute left-0 top-0 text-xs text-gray-400">₹{Math.ceil(maxRevenue * 0.8)}</div>
              <div className="absolute left-0 top-1/2 text-xs text-gray-400" style={{transform: 'translateY(-50%)'}}>₹{Math.ceil(maxRevenue * 0.4)}</div>
              <div className="absolute left-0 bottom-0 text-xs text-gray-400">₹0</div>
              
              {/* Bar chart */}
              <div className="flex-1 flex items-end justify-between w-full h-full ml-8">
                {transactionData.monthlyData.map((month, i) => (
                  <div 
                    key={i} 
                    className={`w-4 rounded-t-lg ${i === transactionData.monthlyData.length - 1 ? 'bg-orange-500' : 'bg-gray-200'} ${i === transactionData.monthlyData.length - 1 ? 'shadow-lg' : ''}`} 
                    style={{
                      height: `${(month.revenue / maxRevenue) * 100}px`, 
                      opacity: i === transactionData.monthlyData.length - 1 ? 1 : 0.4
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Avg label */}
              <div className="absolute left-16 top-8 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                Avg. ₹{avgRevenue.toFixed(0)}
              </div>
            </div>
            
            {/* X axis labels */}
            <div className="flex justify-between text-xs text-gray-400 mt-2 ml-8">
              {transactionData.monthlyData.map((month, i) => (
                <span key={i}>{month.month}</span>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 ml-8">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                <span className="text-xs text-gray-500">Current Month</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                <span className="text-xs text-gray-500">Previous Months</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Sale Performance Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col items-center min-w-[280px]">
        <div className="text-lg font-semibold text-gray-900 mb-2">Sale Performance</div>
        {/* Gauge Chart */}
        <div className="w-full flex items-center justify-center mb-2">
          <SalesPerformanceGauge />
        </div>
      </div>
    </div>
  );
};

export default TransactionPerformance; 