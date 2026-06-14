import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading
}) => {
  return (
    <div className="glass glass-hover p-6 rounded-xl border border-slate-800 transition-all duration-300 relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          {isLoading ? (
            <div className="h-9 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</h3>
          )}
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 text-brand-400 group-hover:text-brand-300 group-hover:border-brand-500/20 transition-all duration-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-2">
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'}`}>
            {trend.value}
          </span>
        )}
        <span className="text-xs text-slate-500 font-medium">{description}</span>
      </div>
    </div>
  );
};
export default MetricCard;
