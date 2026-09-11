import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Ruler, Scale, History, X, Check, Activity, AlertCircle } from 'lucide-react';
import type { BodyMeasurement } from '@yuri/shared';

const BODY_PARTS = ['neck', 'shoulders', 'chest', 'biceps', 'waist', 'hips', 'legs'] as const;

export default function Body() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  // Form state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [neck, setNeck] = useState('');
  const [shoulders, setShoulders] = useState('');
  const [chest, setChest] = useState('');
  const [biceps, setBiceps] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [upperLeg, setUpperLeg] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = localStorage.getItem('yuri_token');

  // Fetch latest snapshot
  const { data: latestMeasurement, isLoading } = useQuery<BodyMeasurement | null>({
    queryKey: ['latestMeasurement'],
    queryFn: async () => {
      const res = await fetch('/api/measurements/latest', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to fetch latest measurements');
      return res.json();
    }
  });

  // Fetch all snapshots for history
  const { data: history = [] } = useQuery<BodyMeasurement[]>({
    queryKey: ['measurementHistory'],
    queryFn: async () => {
      const res = await fetch('/api/measurements', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to fetch measurement history');
      return res.json();
    }
  });

  // Save measurement mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<BodyMeasurement>) => {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save measurements');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestMeasurement'] });
      queryClient.invalidateQueries({ queryKey: ['measurementHistory'] });
      setIsModalOpen(false);
    }
  });

  const openEditModal = () => {
    if (latestMeasurement) {
      setHeight(latestMeasurement.height ? String(latestMeasurement.height) : '');
      setWeight(latestMeasurement.weight ? String(latestMeasurement.weight) : '');
      setNeck(latestMeasurement.neck ? String(latestMeasurement.neck) : '');
      setShoulders(latestMeasurement.shoulders ? String(latestMeasurement.shoulders) : '');
      setChest(latestMeasurement.chest ? String(latestMeasurement.chest) : '');
      setBiceps(latestMeasurement.biceps ? String(latestMeasurement.biceps) : '');
      setWaist(latestMeasurement.waist ? String(latestMeasurement.waist) : '');
      setHips(latestMeasurement.hips ? String(latestMeasurement.hips) : '');
      setUpperLeg(latestMeasurement.upperLeg ? String(latestMeasurement.upperLeg) : '');
      setUnit(latestMeasurement.unit || 'cm');
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: Partial<BodyMeasurement> = {
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      neck: neck ? Number(neck) : undefined,
      shoulders: shoulders ? Number(shoulders) : undefined,
      chest: chest ? Number(chest) : undefined,
      biceps: biceps ? Number(biceps) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined,
      upperLeg: upperLeg ? Number(upperLeg) : undefined,
      unit,
      date: new Date().toISOString()
    };

    saveMutation.mutate(payload);
  };

  const bmi = latestMeasurement?.bmi;
  const currentUnit = latestMeasurement?.unit || unit;

  // Calculate indicator position on BMI scale (15 to 35 range)
  const getBmiPositionPercent = (val?: number): number => {
    if (!val) return 0;
    const clamped = Math.max(15, Math.min(35, val));
    return ((clamped - 15) / (35 - 15)) * 100;
  };

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6 animate-in fade-in duration-300">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('body.title')}</h2>
          <p className="text-textMuted">{t('body.subtitle')}</p>
        </div>
        <button
          onClick={openEditModal}
          className="flex items-center justify-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span>{t('body.logMeasurements')}</span>
        </button>
      </div>

      {/* Live BMI Gauge Card */}
      <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-textPrimary">{t('body.bmiTitle')}</h3>
          {latestMeasurement?.height && latestMeasurement?.weight && (
            <span className="text-xs text-textMuted font-medium">
              {latestMeasurement.height} {currentUnit === 'cm' ? 'cm' : 'in'} · {latestMeasurement.weight} {currentUnit === 'cm' ? 'kg' : 'lbs'}
            </span>
          )}
        </div>

        {bmi ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-black text-primary tracking-tight">
                {bmi.toFixed(1)}
              </div>
              <div className="text-sm font-bold text-textMuted uppercase tracking-wider">
                {bmi < 18.5 && <span className="text-blue-400">{t('body.bmiUnder')}</span>}
                {bmi >= 18.5 && bmi < 25 && <span className="text-primary">{t('body.bmiNormal')}</span>}
                {bmi >= 25 && bmi < 30 && <span className="text-yellow-400">{t('body.bmiOver')}</span>}
                {bmi >= 30 && <span className="text-red-400">{t('body.bmiObese')}</span>}
              </div>
            </div>

            {/* Scale Bar */}
            <div className="relative pt-2">
              <div className="h-3 w-full bg-surfaceElevated rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500 w-[17.5%]" title="Underweight (<18.5)"></div>
                <div className="h-full bg-primary w-[32.5%]" title="Normal (18.5-24.9)"></div>
                <div className="h-full bg-yellow-500 w-[25%]" title="Overweight (25-29.9)"></div>
                <div className="h-full bg-red-500 w-[25%]" title="Obese (>=30)"></div>
              </div>

              {/* Pin Indicator */}
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                style={{ left: `${getBmiPositionPercent(bmi)}%` }}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-black"></div>
              </div>

              <div className="flex justify-between text-xs text-textMuted mt-2">
                <span>{t('body.bmiUnder')} (&lt;18.5)</span>
                <span>{t('body.bmiNormal')} (18.5-24.9)</span>
                <span>{t('body.bmiOver')} (25-29.9)</span>
                <span>{t('body.bmiObese')} (≥30)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3 border border-dashed border-surfaceElevated rounded-xl bg-surfaceElevated/30">
            <Activity className="mx-auto text-primary opacity-60" size={36} />
            <p className="text-xs text-textMuted max-w-xs mx-auto">
              {t('body.emptyBmiPrompt')}
            </p>
            <button
              onClick={openEditModal}
              className="text-xs text-primary font-bold hover:underline"
            >
              + {t('body.logMeasurements')}
            </button>
          </div>
        )}

        <p className="text-xs text-textMuted text-center border-t border-surfaceElevated pt-3">
          {t('body.bmiDisclaimer')}
        </p>
      </div>

      {/* Body Part Measurements Grid */}
      <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-textPrimary">{t('body.measurementsTitle')}</h3>
          <button
            onClick={openEditModal}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <Ruler size={14} />
            <span>{latestMeasurement ? t('body.editSnapshot', 'Update') : t('body.logMeasurements')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {BODY_PARTS.map((part) => {
            const rawVal = latestMeasurement ? (latestMeasurement as any)[part === 'legs' ? 'upperLeg' : part] : null;
            const displayVal = rawVal ? `${rawVal} ${currentUnit}` : '--';

            return (
              <div
                key={part}
                onClick={openEditModal}
                className="flex flex-col justify-between p-3.5 rounded-xl bg-surfaceElevated/60 border border-surfaceElevated hover:border-primary/40 cursor-pointer transition-all"
              >
                <span className="text-xs font-semibold text-textMuted">{t(`body.parts.${part}`)}</span>
                <span className={`text-lg font-black mt-1 ${rawVal ? 'text-textPrimary' : 'text-textMuted/50'}`}>
                  {displayVal}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot History */}
      {history.length > 0 && (
        <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-textPrimary font-bold">
            <History size={18} className="text-primary" />
            <h3 className="text-base">{t('body.historyTitle')}</h3>
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map((snap, idx) => (
              <div
                key={snap._id || snap.id || idx}
                className="flex items-center justify-between p-3 bg-surfaceElevated/40 rounded-xl text-xs border border-surfaceElevated"
              >
                <span className="text-textMuted font-medium">
                  {new Date(snap.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-3">
                  {snap.bmi && (
                    <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                      BMI: {snap.bmi.toFixed(1)}
                    </span>
                  )}
                  {snap.weight && (
                    <span className="text-textPrimary font-semibold">
                      {snap.weight} {snap.unit === 'in' ? 'lbs' : 'kg'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Measurement Snapshot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div>
                <h3 className="text-xl font-black text-textPrimary">{t('body.modalTitle')}</h3>
                <p className="text-xs text-textMuted">Save dated body metrics to calculate BMI & history</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-textMuted hover:text-textPrimary p-1.5 rounded-lg bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Unit Toggle */}
              <div className="flex items-center justify-between bg-surfaceElevated p-2 rounded-xl border border-surfaceElevated">
                <span className="text-xs font-bold text-textMuted">{t('body.unit')}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      unit === 'cm' ? 'bg-primary text-black' : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Metric (cm / kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      unit === 'in' ? 'bg-primary text-black' : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Imperial (in / lbs)
                  </button>
                </div>
              </div>

              {/* Height and Weight Row (Critical for BMI) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">
                    {t('body.height')} ({unit === 'cm' ? 'cm' : 'in'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === 'cm' ? '180' : '71'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">
                    {t('body.weight')} ({unit === 'cm' ? 'kg' : 'lbs'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={unit === 'cm' ? '78' : '172'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Circumference Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.neck')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.shoulders')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shoulders}
                    onChange={(e) => setShoulders(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.chest')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.biceps')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={biceps}
                    onChange={(e) => setBiceps(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.waist')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.hips')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">{t('body.parts.legs')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={upperLeg}
                    onChange={(e) => setUpperLeg(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-textMuted hover:text-textPrimary bg-surfaceElevated transition-colors"
                >
                  {t('body.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saveMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('body.saveSnapshot')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
