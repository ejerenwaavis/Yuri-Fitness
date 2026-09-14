import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  unit?: string;
}

export default function StatCard({ label, value, trend, unit }: StatCardProps) {
  return (
    <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-surfaceElevated shadow-lg flex flex-col justify-between hover:border-primary/40 transition-all group min-h-[125px]">
      {/* Top Row: Trend percentage badge (icons removed for clean breathing room) */}
      <div className="flex items-center justify-between mb-2.5">
        {trend ? (
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            <ArrowUpRight size={13} />
            <span>{trend}</span>
          </span>
        ) : <div />}
      </div>

      {/* Card Content: Prominently displayed Name + Bold Metric Value */}
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-bold text-textPrimary leading-snug group-hover:text-primary transition-colors">
          {label}
        </h4>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-bold text-textMuted">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
