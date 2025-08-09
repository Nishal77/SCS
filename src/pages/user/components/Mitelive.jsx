import React, { useState, useEffect } from 'react';
import { Clock, Coffee, ChefHat } from 'lucide-react';
import { getCanteenStatus } from '../../../lib/canteen-utils';
import BlurVignette from "@/components/ui/blur-vignette"

const Mitelive = () => {
  const [status, setStatus] = useState(getCanteenStatus());
  const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
    const updateStatus = () => {
      setStatus(getCanteenStatus());
      setCurrentTime(new Date());
    };

    // Update immediately
    updateStatus();

    // Update every second for real-time seconds
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      
      <div className="relative max-w-7xl w-full mx-auto">
        <BlurVignette
          radius="24px"
          inset="8px"
          transitionLength="80px"
          blur="20px"
          className="rounded-[2.5rem] w-full h-[180px] sm:h-[220px] shadow-xl overflow-hidden"
          switchView={false}
        >
          <div 
            className="relative w-full h-full bg-cover bg-center bg-no-repeat p-6 flex flex-col justify-between"
            style={{
              backgroundImage: `url('/livecount.JPG')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  status.isOpen 
                    ? 'bg-gradient-to-br from-emerald-400/40 to-green-500/40 text-emerald-100 border border-emerald-300/50 shadow-lg' 
                    : 'bg-gradient-to-br from-red-500/40 to-rose-600/40 text-red-100 border border-red-300/50 shadow-xl'
                }`}>
                  {status.isOpen ? (
                    <div className="relative">
                      
                    </div>
                  ) : (
                    <div className="relative">
                      <ChefHat className="w-5 h-5 text-red-100 drop-shadow-lg" />
                      {/* Closed state pulse effect */}
                      <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className={`text-lg font-bold drop-shadow-lg ${
                      status.isOpen ? 'text-emerald-100' : 'text-white'
                    }`}>
                      {status.isOpen ? 'Canteen is Open!' : 'Canteen is Closed'}
                    </h2>
                    {/* Live status dot */}
                    <div className={`w-2 h-2 rounded-full ${
                      status.isOpen 
                        ? 'bg-emerald-400 animate-pulse' 
                        : 'bg-red-400 animate-pulse'
                    }`}></div>
                  </div>
                  <p className={`font-medium text-sm drop-shadow-md ${
                    status.isOpen ? 'text-emerald-200' : 'text-white'
                  }`}>
                    {status.timeUntil}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 text-white mb-2">
                  <Clock className="w-3 h-3 drop-shadow-md" />
                  <span className="text-xs font-bold drop-shadow-md">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  status.isOpen 
                    ? 'bg-gradient-to-r from-emerald-400/40 to-green-500/40 text-white border-2 border-emerald-300/60 shadow-xl' 
                    : 'bg-gradient-to-r from-red-500/40 to-rose-600/40 text-red-100 border-2 border-red-300/60 shadow-xl'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{status.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}</span>
                    {/* Live status dot */}
                    <div className={`w-2 h-2 rounded-full ${
                      status.isOpen 
                        ? 'bg-emerald-400 animate-pulse' 
                        : 'bg-red-400 animate-pulse'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hours Info */}
            <div className="relative z-10 mt-auto pt-4 border-t border-white/40">
              <div className="flex items-center justify-between text-white text-sm font-bold drop-shadow-md">
                <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-white/20 transition-all duration-300">🕕 Opening Hours: {status.openTime} - {status.closeTime}</span>
                <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-white/20 transition-all duration-300">📅 {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </BlurVignette>
      </div>
    </div>
  );
};

export default Mitelive;
