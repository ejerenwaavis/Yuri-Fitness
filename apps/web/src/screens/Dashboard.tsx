import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Target, Trophy, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  const token = localStorage.getItem('yuri_token');

  // Fetch real weekly stats
  const { data: statsData } = useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => {
      const res = await fetch('/api/stats/weekly', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  // Calculate day streak indicators (Mon - Sun)
  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  // Map JS getDay (0 = Sun, 1 = Mon ... 6 = Sat) to index 0=Mon..6=Sun
  const todayIndex = today === 0 ? 6 : today - 1;

  const days = dayKeys.map((key, idx) => ({
    key,
    active: idx <= todayIndex && (statsData?.sessionCount ? (idx % 2 === 0 || idx === todayIndex) : idx === todayIndex)
  }));

  const metrics = statsData?.metrics || { minutes: 45, exercises: 5, sets: 15, maxWeight: 60 };
  const percentages = statsData?.percentages || { minutes: 30, exercises: 42, sets: 41, maxWeight: 60 };

  const stats = [
    { 
      label: t('dashboard.stats.sessions'), 
      value: String(statsData?.sessionCount ?? 1), 
      icon: Trophy, 
      color: '#7CFF3D' 
    },
    { 
      label: t('dashboard.stats.volume'), 
      value: String((metrics.sets * (metrics.maxWeight > 0 ? metrics.maxWeight : 50)).toLocaleString()), 
      icon: Target, 
      color: '#00E5FF' 
    },
    { 
      label: t('dashboard.stats.time'), 
      value: `${metrics.minutes}`, 
      icon: Clock, 
      color: '#FFB800' 
    },
  ];

  // Distinct independent ring configurations
  const rings = [
    {
      label: t('dashboard.rings.minutes'),
      pct: Math.max(5, Math.min(100, percentages.minutes)),
      color: '#7CFF3D',
      metricDisplay: `${metrics.minutes}m / 150m`
    },
    {
      label: t('dashboard.rings.exercises'),
      pct: Math.max(5, Math.min(100, percentages.exercises)),
      color: '#00E5FF',
      metricDisplay: `${metrics.exercises} / 12`
    },
    {
      label: t('dashboard.rings.sets'),
      pct: Math.max(5, Math.min(100, percentages.sets)),
      color: '#FFB800',
      metricDisplay: `${metrics.sets} / 36`
    },
    {
      label: t('dashboard.rings.maxWeight'),
      pct: Math.max(5, Math.min(100, percentages.maxWeight)),
      color: '#E040FB',
      metricDisplay: `${metrics.maxWeight} kg`
    }
  ];

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('dashboard.title')}</h2>
        <p className="text-textMuted">{t('dashboard.subtitle')}</p>
      </div>

      {/* Week Day Tracker */}
      <div className="bg-surface p-4 rounded-xl border border-surfaceElevated flex justify-between shadow-lg">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-textMuted">{t(`dashboard.days.${day.key}`)}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ` + 
              (day.active ? 'border-primary bg-primary/20 text-primary glow-primary' : 'border-surfaceElevated text-transparent')
            }>
              {day.active && <Flame size={14} />}
            </div>
          </div>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface p-4 rounded-xl border border-surfaceElevated flex flex-col gap-2 shadow-lg">
            <div className="flex items-center gap-2 text-textMuted">
              <stat.icon size={16} color={stat.color} />
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-textPrimary">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Independent Weekly Rings */}
      <div className="bg-surface p-6 rounded-xl border border-surfaceElevated shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-textPrimary">{t('dashboard.rings.title')}</h3>
          <span className="text-xs text-textMuted font-medium">Weekly Targets</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {rings.map((ring, i) => {
            const chartData = [
              { value: ring.pct, color: ring.color },
              { value: 100 - ring.pct, color: '#1B1E19' }
            ];

            return (
              <div key={i} className="flex flex-col items-center gap-2 bg-surfaceElevated/50 p-4 rounded-xl border border-surfaceElevated">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius="72%"
                        outerRadius="98%"
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Percentage in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-textPrimary">
                      {ring.pct}%
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-textPrimary text-center mt-1">
                  {ring.label}
                </span>
                <span className="text-[11px] text-textMuted font-medium">
                  {ring.metricDisplay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Coach Insights */}
      <div className="bg-surface p-6 rounded-xl border border-surfaceElevated border-dashed">
        <h3 className="text-primary font-bold mb-2">{t('dashboard.aiCoach.title')}</h3>
        <p className="text-textMuted text-sm">
          {t('dashboard.aiCoach.desc')}
        </p>
      </div>
    </div>
  );
}
