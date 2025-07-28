import React from 'react';
import { ArrowUpRight, Users, ShoppingCart } from 'lucide-react';

const metrics = [
  {
    title: 'Monthly Revenue',
    value: '₹1,20,000',
    decimal: '',
    range: 'For June 2024',
    icon: ArrowUpRight,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    title: 'Gross Revenue',
    value: '₹3,54,109',
    decimal: '',
    range: 'From Jan 01, 2024 - Jun 30, 2024',
    icon: ArrowUpRight,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Total Orders',
    value: '4,012',
    decimal: '',
    range: 'From Jan 01, 2024 - Jun 30, 2024',
    icon: ShoppingCart,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-500',
  },
  {
    title: 'Active Customers',
    value: '1,156',
    decimal: '',
    range: 'From Jan 01, 2024 - Jun 30, 2024',
    icon: Users,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
];

const MetricsCards = () => (
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
        {/* Date range */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">{metric.range}</div>
      </div>
    ))}
  </div>
);

export default MetricsCards; 