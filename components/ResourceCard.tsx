
import React from 'react';

interface ResourceCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  change?: number;    // Thay đổi thực tế của lượt trước
  forecast?: number;  // Dự báo thay đổi cho lượt tiếp theo (Passive Upkeep/Income)
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ label, value, icon, colorClass, change, forecast }) => {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-lg flex items-center shadow-sm relative group hover:bg-neutral-800/80 transition-colors w-full">
      <div className="flex items-center gap-3 w-full">
        <div className={`text-xl ${colorClass} w-8 text-center shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col w-full">
           <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold flex justify-between">
             {label}
             {/* Forecast Indicator */}
             {typeof forecast === 'number' && forecast !== 0 && (
               <span className={`text-[9px] ${forecast > 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                 Dự kiến: {forecast > 0 ? '+' : ''}{forecast.toLocaleString()}/tháng
               </span>
             )}
           </span>
           <div className="flex items-baseline gap-2">
             <span className="text-lg font-bold text-neutral-200 font-display leading-none">
               {typeof value === 'number' ? value.toLocaleString() : value}
             </span>
             
             {/* Actual Last Change Indicator */}
             {change !== undefined && change !== 0 && (
               <span className={`text-xs font-bold ${change > 0 ? 'text-green-500' : 'text-red-500'} animate-fade-in`}>
                 {change > 0 ? '▲' : '▼'} {Math.abs(change).toLocaleString()}
               </span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};