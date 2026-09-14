import React from 'react';
import { Calendar, ChevronRight, ArrowUpRight, Dumbbell } from 'lucide-react';
import { useUnit } from '../context/UnitContext';

interface RecentActivityItem {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  volumeKg?: number;
  exerciseCount?: number;
  trend?: string;
}

interface RecentActivityListProps {
  activities?: RecentActivityItem[];
  onSelect?: (id: string) => void;
}

export default function RecentActivityList({ activities = [], onSelect }: RecentActivityListProps) {
  const { unit, toDisplayWeight } = useUnit();

  if (activities.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-dashed border-surfaceElevated text-center space-y-2">
        <Dumbbell className="mx-auto text-textMuted opacity-40" size={32} />
        <p className="text-xs sm:text-sm text-textMuted font-medium">
          No recent workout sessions recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => {
        const displayVol = item.volumeKg ? toDisplayWeight(item.volumeKg) : 0;
        const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });

        return (
          <div
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className="bg-surface p-4 rounded-2xl border border-surfaceElevated hover:border-primary/40 flex items-center justify-between cursor-pointer transition-all group shadow-md"
          >
            {/* Left: Icon square + Name + Date / Duration */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <Calendar size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-textPrimary group-hover:text-primary transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-textMuted mt-0.5 truncate">
                  {formattedDate} • {item.durationMinutes} min • {item.exerciseCount || 0} exercises
                </p>
              </div>
            </div>

            {/* Right: Volume + Trend Percentage */}
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                <span className="text-sm sm:text-base font-black text-textPrimary block">
                  {displayVol > 0 ? `${displayVol.toLocaleString()} ${unit}` : 'Bodyweight'}
                </span>
                {item.trend && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary">
                    <ArrowUpRight size={12} />
                    {item.trend}
                  </span>
                )}
              </div>
              <ChevronRight size={18} className="text-textMuted group-hover:text-textPrimary transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
