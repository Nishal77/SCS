import React from 'react';

export default function Hero() {
  return (
    <div className="w-full min-h-[350px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center ">
      <img
        src="/1346.jpg"
        alt="Hero"
        className="w-full h-full object-cover object-center max-h-[600px]"
        style={{ display: 'block' }}
      />
    </div>
  );
}
