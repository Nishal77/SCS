import React from 'react';

const FoodSymbol = ({ type = 'veg', size = 'large' }) => {
  const isVeg = type === 'veg';

  // Define styles based on the type prop
  const config = {
    veg: {
      container: 'border-green-500/80 group-hover:border-green-500',
      shape: 'bg-gradient-to-br from-green-400 to-green-600',
      shapeClass: 'rounded-full', // Circle
      text: 'text-green-600',
      label: 'VEG',
    },
    'non-veg': {
      container: 'border-red-500/80 group-hover:border-red-500',
      shape: 'bg-gradient-to-br from-red-500 to-red-700',
      // Triangle using Tailwind's arbitrary values for borders
      shapeClass: 'w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-b-[60px] border-b-red-600',
      text: 'text-red-600',
      label: 'NON-VEG',
    },
  };

  const currentConfig = config[type];

  // Small version for toggle buttons
  if (size === 'small') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`
            flex h-5 w-5 items-center justify-center 
            rounded-full border-2 bg-white shadow-sm
            transition-all duration-300 ease-in-out 
            ${currentConfig.container}
          `}
        >
          <div
            className={`
              transition-transform duration-300 
              ${isVeg ? `h-2.5 w-2.5 ${currentConfig.shape} rounded-full` : ''} 
              ${!isVeg ? 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-600' : ''}
            `}
          ></div>
        </div>
        <span className="font-bold text-sm">{currentConfig.label}</span>
      </div>
    );
  }

  // Large version (default)
  return (
    <div className="group flex flex-col items-center gap-y-3 font-sans">
      {/* Outer Square */}
      <div
        className={`
          flex h-32 w-32 items-center justify-center 
          rounded-lg border-4 bg-white/50 shadow-sm
          transition-all duration-300 ease-in-out 
          group-hover:scale-105 group-hover:shadow-xl
          ${currentConfig.container}
        `}
      >
        {/* Inner Shape (Circle or Triangle) */}
        <div
          className={`
            transition-transform duration-300 
            group-hover:scale-110
            ${isVeg ? `h-20 w-20 ${currentConfig.shape}` : ''} 
            ${currentConfig.shapeClass}
          `}
        ></div>
      </div>
      
      {/* Label */}
      <p
        className={`
          text-lg font-bold tracking-widest
          transition-colors duration-300
          ${currentConfig.text}
        `}
      >
        {currentConfig.label}
      </p>
    </div>
  );
};

export default FoodSymbol; 