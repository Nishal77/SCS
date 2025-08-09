import React, { useState, useEffect } from 'react';
import { Clock, Coffee, AlertCircle } from 'lucide-react';
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
    
    // Update every minute
    const interval = setInterval(updateStatus, 60000);
    
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
                    : 'bg-white/20 text-white'
                }`}>
                  {status.isOpen ? (
                    <div className="relative">
                      <Coffee className="w-6 h-6 text-emerald-100 drop-shadow-lg" />
                      {/* Live effect pulse */}
                      <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse"></div>
                    </div>
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {status.isOpen ? 'Canteen is Open!' : 'Canteen is Closed'}
                  </h2>
                  <p className="text-white font-semibold text-lg drop-shadow-md">
                    {status.timeUntil}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 text-white mb-2">
                  <Clock className="w-4 h-4 drop-shadow-md" />
                  <span className="text-sm font-bold drop-shadow-md">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  status.isOpen 
                    ? 'bg-gradient-to-r from-emerald-400/40 to-green-500/40 text-white border-2 border-emerald-300/60 shadow-xl' 
                    : 'bg-white/30 text-white border-2 border-white/50 shadow-lg'
                }`}>
                  {status.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                </div>
              </div>
            </div>
            
            {/* Hours Info */}
            <div className="relative z-10 mt-auto pt-4 border-t border-white/40">
              <div className="flex items-center justify-between text-white text-sm font-bold drop-shadow-md">
                <span className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30">🕕 Opening Hours: {status.openTime} - {status.closeTime}</span>
                <span>📅 {currentTime.toLocaleDateString('en-US', { 
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
