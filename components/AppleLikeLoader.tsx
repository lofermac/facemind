import React from 'react';

interface AppleLikeLoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function AppleLikeLoader({ size = 44, className = '', text }: AppleLikeLoaderProps) {
  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <div className="relative w-20 h-20">
        {/* Anel principal com gradiente */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 animate-spin" style={{ animationDuration: '1s' }}>
          <div className="w-full h-full rounded-full bg-white m-1"></div>
        </div>
        
        {/* Anel secundário */}
        <div className="absolute inset-2 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
        
        {/* Pontos orbitais múltiplos */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2 shadow-lg"></div>
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full absolute top-1/2 -right-1 transform -translate-y-1/2 shadow-md"></div>
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2.5s' }}>
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full absolute bottom-0 left-1/2 transform translate-y-1 -translate-x-1/2 shadow-md"></div>
        </div>
        
        {/* Núcleo pulsante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse shadow-xl"></div>
          <div className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        </div>
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          <div className="w-1 h-1 bg-blue-300 rounded-full absolute top-2 left-2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-purple-300 rounded-full absolute bottom-3 right-3 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          <div className="w-1 h-1 bg-cyan-300 rounded-full absolute top-3 right-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
} 