// components/SkeletonLoader.tsx
'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'metric' | 'widget' | 'table' | 'list';
  className?: string;
}

export default function SkeletonLoader({ type = 'card', className = '' }: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-slate-200 rounded-lg";

  switch (type) {
    case 'metric':
      return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`${baseClasses} h-4 w-24 mb-2`}></div>
              <div className={`${baseClasses} h-8 w-16`}></div>
            </div>
            <div className={`${baseClasses} w-10 h-10 rounded-full`}></div>
          </div>
        </div>
      );

    case 'widget':
      return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`${baseClasses} w-6 h-6 rounded-full`}></div>
            <div className={`${baseClasses} h-5 w-32`}></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className={`${baseClasses} h-4 w-40 mb-1`}></div>
                  <div className={`${baseClasses} h-3 w-24`}></div>
                </div>
                <div className={`${baseClasses} h-6 w-20 rounded-full`}></div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
          <div className={`${baseClasses} h-6 w-48 mb-4`}></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <div className="flex-1">
                  <div className={`${baseClasses} h-4 w-32 mb-1`}></div>
                  <div className={`${baseClasses} h-3 w-20`}></div>
                </div>
                <div className={`${baseClasses} h-8 w-24 rounded-lg`}></div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'table':
      return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
          <div className="p-6">
            <div className={`${baseClasses} h-6 w-48 mb-4`}></div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <div className={`${baseClasses} h-4 w-20`}></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className={`${baseClasses} h-4 w-16`}></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    default: // 'card'
      return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
          <div className={`${baseClasses} h-6 w-48 mb-4`}></div>
          <div className={`${baseClasses} h-4 w-full mb-2`}></div>
          <div className={`${baseClasses} h-4 w-3/4 mb-2`}></div>
          <div className={`${baseClasses} h-4 w-1/2`}></div>
        </div>
      );
  }
}
