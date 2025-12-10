import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputCardProps {
  label: string;
  value: number;
  onChange?: (val: number) => void;
  icon: LucideIcon;
  suffix?: string;
  colorClass?: string;
  readOnly?: boolean;
}

export const InputCard: React.FC<InputCardProps> = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  suffix,
  colorClass = "text-gray-500",
  readOnly = false
}) => {
  return (
    <div className={`
      relative p-4 rounded-xl border transition-colors
      ${readOnly 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-100 hover:border-indigo-100 shadow-sm'
      }
    `}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          min="0"
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          placeholder="0"
          className={`
            w-full text-2xl font-bold focus:outline-none placeholder-gray-200 bg-transparent
            ${readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-gray-800'}
          `}
        />
        {suffix && <span className="text-gray-400 text-sm ml-2">{suffix}</span>}
      </div>
      {readOnly && (
        <div className="absolute top-4 right-4 text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
          自动
        </div>
      )}
    </div>
  );
};