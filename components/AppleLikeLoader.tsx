import React from 'react';

interface AppleLikeLoaderProps {
  text?: string;
  className?: string;
}

export default function AppleLikeLoader({ text = 'Carregando...', className = '' }: AppleLikeLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-4 border-b-4 border-gray-200 border-t-blue-500 border-b-blue-300 animate-spin shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10)' }} />
        <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-white/80 to-blue-50/60 blur-sm" />
      </div>
      {text && <span className="mt-4 text-base font-medium text-slate-600 animate-pulse drop-shadow-sm">{text}</span>}
    </div>
  );
} 