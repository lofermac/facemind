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
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-3 md:p-4 lg:p-6 group hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 border border-white/30">
      <div className="flex items-center justify-between">
        <div>
          <dt className="text-[11px] md:text-xs font-semibold text-slate-600 truncate group-hover:text-blue-600 transition-colors duration-200 ease-in-out">
            {title}
          </dt>
          <dd className="mt-0.5 text-2xl md:text-3xl font-bold text-slate-900 drop-shadow-sm">
            {value}
          </dd>
        </div>
        <div className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow-sm ${iconColor} group-hover:scale-110 transition-transform duration-200 ease-in-out`}>
          <IconComponent className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}