import React from 'react';

const BlurdLogo: React.FC = () => {
  return (
    <div className="relative font-bold text-3xl tracking-tight">
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs opacity-60 text-blue-500">✦ ✦</span>
      <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
        blurd
      </span>
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-60 text-red-500">✦ ✦</span>
    </div>
  );
};

export default BlurdLogo;
