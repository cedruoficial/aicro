import type { MetricCardConfig } from '../types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  data: MetricCardConfig;
}

export function KPICard({ data }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#6C5CE7] bg-opacity-[0.08] flex items-center justify-center text-2xl">
          {data.icon}
        </div>
        {data.trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${
            data.trend === 'up' ? 'text-[#00B894] bg-[#00B894] bg-opacity-10' :
            data.trend === 'down' ? 'text-[#FF4757] bg-[#FF4757] bg-opacity-10' :
            'text-[#8B8BA0] bg-[#EEEDF5]'
          }`}>
            {data.trend === 'up' && <TrendingUp size={12} strokeWidth={3} />}
            {data.trend === 'down' && <TrendingDown size={12} strokeWidth={3} />}
            {data.trend === 'neutral' && <Minus size={12} strokeWidth={3} />}
            {data.trendValue && <span>{data.trendValue}</span>}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[28px] font-extrabold text-[#2D2D3A] tracking-tight leading-none mb-1">
          {data.value}
        </h3>
        <p className="text-sm font-semibold text-[#6C5CE7] mb-0.5">
          {data.title}
        </p>
        <p className="text-xs text-[#8B8BA0] font-medium">
          {data.subtitle}
        </p>
      </div>
    </div>
  );
}
