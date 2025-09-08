import React from 'react';

interface SkeletonCardProps {
  type?: 'patient' | 'procedure' | 'financial' | 'dashboard';
  className?: string;
}

export default function SkeletonCard({ type = 'dashboard', className = '' }: SkeletonCardProps) {
  switch (type) {
    case 'patient':
      return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-md w-32 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded-md w-24"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-100 rounded-md w-full"></div>
            <div className="h-3 bg-gray-100 rounded-md w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
          </div>
        </div>
      );

    case 'procedure':
      return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded-md w-40"></div>
            <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-4 bg-gray-100 rounded-md"></div>
            <div className="h-4 bg-gray-100 rounded-md"></div>
          </div>
          <div className="h-3 bg-gray-100 rounded-md w-2/3"></div>
        </div>
      );

    case 'financial':
      return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded-md w-32"></div>
          </div>
          <div className="h-8 bg-gray-100 rounded-md w-24 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded-md w-16"></div>
          <div className="mt-4 h-20 bg-gray-50 rounded-lg"></div>
        </div>
      );

    default: // dashboard
      return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-gray-200 rounded-md w-36"></div>
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
          </div>
          <div className="h-10 bg-gray-100 rounded-md w-20 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded-md w-24 mb-6"></div>
          <div className="h-16 bg-gray-50 rounded-lg"></div>
        </div>
      );
  }
}

// Componente para grid de skeletons
export function SkeletonGrid({ 
  count = 6, 
  type = 'dashboard',
  className = '' 
}: { 
  count?: number; 
  type?: 'patient' | 'procedure' | 'financial' | 'dashboard';
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} type={type} />
      ))}
    </div>
  );
}
