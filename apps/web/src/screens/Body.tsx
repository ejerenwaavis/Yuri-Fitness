import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Body() {
  const { t } = useTranslation();
  const bmi = 24.5; // Stub
  
  const bodyParts = ['neck', 'shoulders', 'chest', 'biceps', 'waist', 'hips', 'legs'];

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('body.title')}</h2>
        <p className="text-textMuted">{t('body.subtitle')}</p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated">
        <h3 className="text-lg font-bold text-textPrimary mb-4">{t('body.bmiTitle')}</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-5xl font-black text-primary">{bmi}</div>
          <div className="flex-1 max-w-sm">
            <div className="h-4 w-full bg-surfaceElevated rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 w-1/4"></div>
              <div className="h-full bg-primary w-1/4"></div>
              <div className="h-full bg-yellow-500 w-1/4"></div>
              <div className="h-full bg-red-500 w-1/4"></div>
            </div>
            <div className="flex justify-between text-xs text-textMuted mt-2">
              <span>{t('body.bmiUnder')}</span>
              <span>{t('body.bmiNormal')}</span>
              <span>{t('body.bmiOver')}</span>
              <span>{t('body.bmiObese')}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-textMuted mt-4 text-center">{t('body.bmiDisclaimer')}</p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated">
        <h3 className="text-lg font-bold text-textPrimary mb-4">{t('body.measurementsTitle')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {bodyParts.map(part => (
            <div key={part} className="flex justify-between items-center bg-background p-3 rounded-md border border-surfaceElevated">
              <span className="text-sm font-medium text-textMuted">{t(`body.parts.${part}`)}</span>
              <span className="text-textPrimary font-bold">-- cm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
