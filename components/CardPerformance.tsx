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
    <div className="bg-white shadow-sm rounded-md p-5 h-full flex flex-col group hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1">
      <div>
        <dt className="text-xs font-medium text-gray-500 truncate group-hover:text-blue-600 transition-colors duration-200 ease-in-out">
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
          <p className={`text-2xl lg:text-3xl font-semibold ${valueColor}`}>
            {currentValue}
          </p>
          {Icon && (
            <div className={`ml-2 flex items-baseline text-xs font-semibold ${valueColor} group-hover:scale-105 transition-transform duration-200 ease-in-out`}> {/* Efeito no percentual/ícone */}
              <Icon className={`self-center flex-shrink-0 h-3.5 w-3.5 ${iconColor}`} aria-hidden="true" />
              <span className="sr-only">{isPositive ? 'Aumentou' : 'Diminuiu'} em</span>
              <span className="ml-1">{percentageChange}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}