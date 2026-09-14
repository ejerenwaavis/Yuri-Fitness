import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  unit?: string;
}

export default function StatCard({ icon: Icon, label, value, trend, unit }: StatCardProps) {
  return (
    <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-surfaceElevated shadow-lg flex flex-col justify-between hover:border-primary/40 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
          <Icon size={20} />
        </div>
        {trend && (
          <div className="flex items-center gap-0.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <ArrowUpRight size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-textMuted block mb-1">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-bold text-textMuted">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
