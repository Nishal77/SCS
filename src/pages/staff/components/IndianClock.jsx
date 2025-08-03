import React, { useState, useEffect } from "react";

const IndianClock = () => {
  const [dateState, setDateState] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateState(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        {dateState.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata", // Indian Standard Time
        })}
      </span>
      <span className="text-xs text-gray-500">IST</span>
    </div>
  );
};

export default IndianClock; 