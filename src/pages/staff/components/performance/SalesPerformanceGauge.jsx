import React, { useState } from "react";
import { AgGauge } from "ag-charts-react";
import "ag-charts-enterprise";

const PERFORMANCE_VALUES = {
  Day: 85,
  Week: 72,
  Month: 91,
};

export default function SalesPerformanceGauge() {
  const [period, setPeriod] = useState("Day");
  const value = PERFORMANCE_VALUES[period];

  const options = {
    type: "radial-gauge",
    value,
    scale: {
      min: 0,
      max: 100,
    },
    segmentation: {
      enabled: true,
      interval: {
        count: 4,
      },
      spacing: 2,
    },
    label: {
      fontSize: 24, // Further reduce the central value font size
      color: '#222',
      fontWeight: '600',
      fontFamily: 'Inter, sans-serif',
    },
    // Make the gauge look more modern and "wow"
    needle: {
      enabled: false,
    },
    track: {
      width: 0.18,
      color: '#f3f4f6',
    },
    fill: {
      colors: [
        '#22c55e', // green
        '#eab308', // yellow
        '#f59e42', // orange
        '#fb7185', // red
        '#e5e7eb', // gray
      ],
    },
    animation: {
      enabled: true,
      duration: 600,
    },
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  return (
    <div className="flex flex-col items-center w-full" style={{marginBottom: 0, paddingBottom: 0}}>
      <div className="flex gap-2 mb-0">
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
      <div className="flex justify-center items-center w-full" style={{marginBottom: 0, paddingBottom: 0}}>
        <AgGauge options={options} style={{ width: 300, height: 180, maxWidth: '100%', marginBottom: 0, paddingBottom: 0 }} />
      </div>
    </div>
  );
} 