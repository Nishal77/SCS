import React from 'react';
import SalesPerformanceGauge from './performance/SalesPerformanceGauge';

const TransactionPerformance = () => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 mb-8">
      {/* Transaction Activity Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex flex-col lg:col-span-2 min-w-[320px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold text-gray-900">Transaction Activity</div>
          <button className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">This Years</button>
        </div>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">3,541</span>
          <span className="text-xl md:text-2xl font-semibold text-gray-300 mb-0.5">.09</span>
        </div>
        {/* Chart Placeholder */}
        <div className="w-full h-32 flex items-end mt-2 relative">
          {/* Y axis labels */}
          <div className="absolute left-0 top-0 text-xs text-gray-400">30k</div>
          <div className="absolute left-0 top-1/2 text-xs text-gray-400" style={{transform: 'translateY(-50%)'}}>20k</div>
          <div className="absolute left-0 bottom-0 text-xs text-gray-400">0</div>
          {/* Bar chart (placeholder) */}
          <div className="flex-1 flex items-end justify-between w-full h-full ml-8">
            {[8, 12, 16, 20, 28, 30, 25, 18, 12, 10, 8, 6].map((val, i) => (
              <div key={i} className={`w-4 rounded-t-lg ${i === 6 ? 'bg-orange-500' : 'bg-gray-200'} ${i === 6 ? 'shadow-lg' : ''}`} style={{height: `${val * 3}px`, opacity: i === 6 ? 1 : 0.4}}></div>
            ))}
          </div>
          {/* Avg label */}
          <div className="absolute left-16 top-8 bg-black text-white text-xs px-2 py-0.5 rounded-full">Avg. 25.3k</div>
        </div>
        {/* X axis labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2 ml-8">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 ml-8">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
            <span className="text-xs text-gray-500">Total Transaction</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-300 inline-block"></span>
            <span className="text-xs text-gray-500">Success Transaction</span>
          </div>
        </div>
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