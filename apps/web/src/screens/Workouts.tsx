import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronRight } from 'lucide-react';

export default function Workouts() {
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetch('/api/workouts').then(res => res.json())
  });

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">Workouts</h2>
        <p className="text-textMuted">Your recent training history.</p>
      </div>

      {isLoading ? (
        <div className="text-textMuted">Loading...</div>
      ) : (
        <div className="space-y-4">
          {workouts?.map((w: any) => (
            <div key={w.id} className="bg-surface p-4 rounded-lg border border-surfaceElevated flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="bg-surfaceElevated p-3 rounded-md text-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-textPrimary">
                    {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h4>
                  <p className="text-sm text-textMuted">
                    {w.exercises.length} exercises • {w.durationMinutes} min
                  </p>
                </div>
              </div>
              <ChevronRight className="text-textMuted group-hover:text-primary transition-colors" />
            </div>
          ))}

          {workouts?.length === 0 && (
            <div className="text-center p-8 border border-dashed border-surfaceElevated rounded-lg">
              <p className="text-textMuted mb-4">No workouts logged yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
