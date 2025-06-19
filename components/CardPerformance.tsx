// components/CardPerformance.tsx
import React from 'react';

interface CardPerformanceProps {
  title: string;
  currentValue: string;
  percentageChange: string;
  isPositive: boolean;
  periodDescription?: string;
  Icon?: React.ElementType; 
}

export default function CardPerformance({
  title,
  currentValue,
  percentageChange,
  isPositive,
  periodDescription,
  Icon
}: CardPerformanceProps) {
  const valueColor = isPositive ? 'text-green-600' : 'text-red-500';
  const iconColor = isPositive ? 'text-green-500' : 'text-red-500'; 

  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-4 sm:p-6 h-full flex flex-col group hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 border border-white/30">
      <div>
        <dt className="text-xs font-semibold text-slate-600 truncate group-hover:text-blue-600 transition-colors duration-200 ease-in-out">
          {title}
        </dt>
        {periodDescription && (
          <p className="text-xs text-gray-400 mt-0.5">
            {periodDescription}
          </p>
        )}
      </div>
      <div className="mt-2 flex-grow flex flex-col items-start justify-center">
        <div className="flex items-baseline">
          <p className={`text-3xl lg:text-4xl font-bold drop-shadow-sm ${valueColor}`}>
            {currentValue}
          </p>
          {Icon && (
            <div className={`ml-3 flex items-baseline text-base font-semibold ${valueColor} group-hover:scale-105 transition-transform duration-200 ease-in-out`}>
              <Icon className={`self-center flex-shrink-0 h-4 w-4 ${iconColor}`} aria-hidden="true" />
              <span className="sr-only">{isPositive ? 'Aumentou' : 'Diminuiu'} em</span>
              <span className="ml-1">{percentageChange}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}