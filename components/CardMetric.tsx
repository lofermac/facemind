// components/CardMetric.tsx
import React from 'react';

interface CardMetricProps {
  title: string;
  value: string | number;
  IconComponent: React.ElementType; 
  iconColor?: string;       
}

export default function CardMetric({ title, value, IconComponent, iconColor = "text-gray-400" }: CardMetricProps) {
  return (
    <div className="bg-white shadow-sm rounded-md p-5 group hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1"> {/* Efeitos de hover */}
      <div className="flex items-center justify-between">
        <div>
          <dt className="text-xs font-medium text-gray-500 truncate group-hover:text-blue-600 transition-colors duration-200 ease-in-out"> {/* Cor do título no hover */}
            {title}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-800">
            {value}
          </dd>
        </div>
        <div className={`${iconColor} group-hover:scale-110 transition-transform duration-200 ease-in-out`}> {/* Efeito no ícone */}
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}