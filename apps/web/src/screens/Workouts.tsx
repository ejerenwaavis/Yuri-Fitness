import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronRight, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Workouts() {
  const { t } = useTranslation();
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => fetch('/api/workouts').then(res => res.json())
  });

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('workouts.title')}</h2>
          <p className="text-textMuted">{t('workouts.subtitle')}</p>
        </div>
        <Link
          to="/exercises"
          className="inline-flex items-center gap-2 bg-surfaceElevated hover:bg-primary/20 text-primary border border-primary/30 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Film size={18} />
          <span>{t('workouts.browseLibrary')}</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-textMuted">{t('workouts.loading')}</div>
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
                    {w.exercises.length} {t('workouts.exercises')} • {w.durationMinutes} {t('workouts.min')}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-textMuted group-hover:text-primary transition-colors" />
            </div>
          ))}

          {workouts?.length === 0 && (
            <div className="text-center p-8 border border-dashed border-surfaceElevated rounded-lg">
              <p className="text-textMuted mb-4">{t('workouts.empty')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
