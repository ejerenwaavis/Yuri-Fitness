import React from 'react';
import StatCard from './StatCard';
import { useUnit } from '../context/UnitContext';

interface QuickStatsData {
  totalWorkouts?: { value: number; trend: string; label: string };
  activeTime?: { valueMinutes: number; trend: string; label: string };
  totalVolume?: { valueKg: number; trend: string; label: string };
  caloriesBurned?: { value: number; trend: string; label: string };
}

interface QuickStatsGridProps {
  stats?: QuickStatsData;
  isLoading?: boolean;
}

export default function QuickStatsGrid({ stats, isLoading }: QuickStatsGridProps) {
  const { unit, toDisplayWeight } = useUnit();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surfaceElevated/50 border border-surfaceElevated" />
        ))}
      </div>
    );
  }

  const workouts = stats?.totalWorkouts?.value ?? 0;
  const workoutsTrend = stats?.totalWorkouts?.trend ?? '+12%';

  const minutes = stats?.activeTime?.valueMinutes ?? 0;
  const minutesTrend = stats?.activeTime?.trend ?? '+8%';

  const volumeKg = stats?.totalVolume?.valueKg ?? 0;
  const displayVolume = toDisplayWeight(volumeKg);
  const volumeTrend = stats?.totalVolume?.trend ?? '+15%';

  const calories = stats?.caloriesBurned?.value ?? 0;
  const caloriesTrend = stats?.caloriesBurned?.trend ?? '+10%';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Total Workouts"
        value={workouts}
        trend={workoutsTrend}
      />
      <StatCard
        label="Active Time"
        value={`${minutes}m`}
        trend={minutesTrend}
      />
      <StatCard
        label="Total Volume"
        value={displayVolume.toLocaleString()}
        unit={unit}
        trend={volumeTrend}
      />
      <StatCard
        label="Calories Burned"
        value={calories.toLocaleString()}
        unit="kcal"
        trend={caloriesTrend}
      />
    </div>
  );
}
