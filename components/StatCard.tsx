import React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtext }) => {
  return (
    <div className="bg-xan-800 border border-xan-700 rounded-lg p-5 shadow-lg flex flex-col justify-between hover:border-xan-500 transition-colors transition-transform duration-300 transform hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-xan-400">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
      </div>
    </div>
  );
};