import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Target, Trophy, Clock } from 'lucide-react';

export default function Dashboard() {
  const days = [
    { name: 'M', active: true },
    { name: 'T', active: true },
    { name: 'W', active: false },
    { name: 'T', active: true },
    { name: 'F', active: false },
    { name: 'S', active: false },
    { name: 'S', active: false },
  ];

  const ringData = [
    { value: 75, color: '#7CFF3D' },
    { value: 25, color: '#2A2C29' } 
  ];

  const stats = [
    { label: 'Sessions', value: '12', icon: Trophy, color: '#7CFF3D' },
    { label: 'Volume (lbs)', value: '14,200', icon: Target, color: '#00E5FF' },
    { label: 'Time (m)', value: '340', icon: Clock, color: '#FFB800' },
  ];

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">Ready to crush it?</h2>
        <p className="text-textMuted">Let's see what you can do this week.</p>
      </div>

      <div className="bg-surface p-4 rounded-lg border border-surfaceElevated flex justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-textMuted">{day.name}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ` + 
              (day.active ? 'border-primary bg-primary/20 text-primary glow-primary' : 'border-surfaceElevated text-transparent')
            }>
              {day.active && <Flame size={14} />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface p-4 rounded-lg border border-surfaceElevated flex flex-col gap-2">
            <div className="flex items-center gap-2 text-textMuted">
              <stat.icon size={16} color={stat.color} />
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-textPrimary">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated">
        <h3 className="text-lg font-bold text-textPrimary mb-4">Weekly Rings</h3>
        <div className="flex justify-around items-center h-32">
          {['Minutes', 'Exercises', 'Sets', 'Max Weight'].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-1/4">
              <div className="h-16 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ringData}
                      innerRadius="70%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {ringData.map((entry, index) => (
                        <Cell key={`cell-`+index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-xs text-textMuted font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated border-dashed">
        <h3 className="text-primary font-bold mb-2">AI Coach Insights (Coming Soon)</h3>
        <p className="text-textMuted text-sm">
          // TODO: Phase 2 AI recovery scoring and session optimization will appear here.
        </p>
      </div>
    </div>
  );
}
