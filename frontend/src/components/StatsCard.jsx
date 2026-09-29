import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, subtitle }) => {
  return (
    <div className="relative overflow-hidden bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-amber-50/60 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs group-hover:scale-105 transition-transform">
            <Icon size={22} className="stroke-[2.2]" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}>
            {trend.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend.value}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
