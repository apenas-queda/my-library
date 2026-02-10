
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, color = 'bg-indigo-600' }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs font-medium text-gray-600">
        <span>{percentage}% complete</span>
        <span>{current} / {total} {total === 1 ? 'unit' : 'units'}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
