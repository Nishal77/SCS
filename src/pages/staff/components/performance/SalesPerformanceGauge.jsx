import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PERFORMANCE_VALUES = {
  Day: 85,
  Week: 72,
  Month: 91,
};

export default function SalesPerformanceGauge() {
  const [period, setPeriod] = useState("Day");
  const value = PERFORMANCE_VALUES[period];

  // Create data for the pie chart to simulate a gauge
  const data = [
    { name: 'value', value: value, fill: '#f97316' }, // Orange for the value
    { name: 'remaining', value: 100 - value, fill: '#f3f4f6' } // Gray for remaining
  ];

  return (
    <div className="flex flex-col items-center w-full" style={{marginBottom: 0, paddingBottom: 0}}>
      <div className="flex gap-2 mb-4">
        {Object.keys(PERFORMANCE_VALUES).map((label) => (
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
    </div>
  );
} 