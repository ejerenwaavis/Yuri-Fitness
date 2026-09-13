import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Ruler,
  Scale,
  History,
  X,
  Check,
  Activity,
  AlertCircle,
  Camera,
  Upload,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { BodyMeasurement } from '@yuri/shared';
import { useUnit } from '../context/UnitContext';

const BODY_PARTS = ['neck', 'shoulders', 'chest', 'biceps', 'waist', 'hips', 'legs'] as const;

export default function Body() {
  const { t } = useTranslation();
  const { unit: weightUnit, formatWeight, toDisplayWeight, fromDisplayWeight } = useUnit();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('yuri_token');

  // Sub-tabs: 'measurements' vs 'photos'
  const [activeTab, setActiveTab] = useState<'measurements' | 'photos'>('measurements');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [lengthUnit, setLengthUnit] = useState<'cm' | 'in'>('cm');

  // Measurement Form state
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

  // Photo Upload State (front, side, back)
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoWeight, setPhotoWeight] = useState('');
  const [frontPhotoUrl, setFrontPhotoUrl] = useState<string | null>(null);
  const [sidePhotoUrl, setSidePhotoUrl] = useState<string | null>(null);
  const [backPhotoUrl, setBackPhotoUrl] = useState<string | null>(null);
  const [uploadingAngle, setUploadingAngle] = useState<'front' | 'side' | 'back' | null>(null);

  // 2-Date Comparison State
  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');

  // 1. Fetch latest measurements snapshot
  const { data: latestMeasurement } = useQuery<BodyMeasurement | null>({
    queryKey: ['latestMeasurement'],
    queryFn: async () => {
      const res = await fetch('/api/measurements/latest', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch latest measurements');
      return res.json();
    }
  });

  // 2. Fetch all measurement snapshots for history
  const { data: history = [] } = useQuery<BodyMeasurement[]>({
    queryKey: ['measurementHistory'],
    queryFn: async () => {
      const res = await fetch('/api/measurements', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch measurement history');
      return res.json();
    }
  });

  // 3. Fetch progress photos / entries
  const { data: progressEntries = [] } = useQuery<any[]>({
    queryKey: ['progressEntries'],
    queryFn: async () => {
      const res = await fetch('/api/progress', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch progress entries');
      return res.json();
    }
  });

  // 4. Fetch weight progression chart history
  const { data: weightHistory = [] } = useQuery<any[]>({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      const res = await fetch('/api/progress/weight-history', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch weight history');
      return res.json();
    }
  });

  // Format chart data
  const chartData = weightHistory.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: toDisplayWeight(entry.weight)
  }));

  // Save measurement mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<BodyMeasurement>) => {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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

  // Save progress entry (photos + weight) mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save progress entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
      setIsPhotoModalOpen(false);
      setFrontPhotoUrl(null);
      setSidePhotoUrl(null);
      setBackPhotoUrl(null);
    }
  });

  // Cloudinary image upload handler
  const handlePhotoUpload = async (file: File, angle: 'front' | 'side' | 'back') => {
    setUploadingAngle(angle);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/progress/upload-photo', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (angle === 'front') setFrontPhotoUrl(data.url);
      if (angle === 'side') setSidePhotoUrl(data.url);
      if (angle === 'back') setBackPhotoUrl(data.url);
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('Photo upload failed. Please try a smaller image file.');
    } finally {
      setUploadingAngle(null);
    }
  };

  const openEditModal = () => {
    if (latestMeasurement) {
      setHeight(latestMeasurement.height ? String(latestMeasurement.height) : '');
      setWeight(latestMeasurement.weight ? String(toDisplayWeight(latestMeasurement.weight)) : '');
      setNeck(latestMeasurement.neck ? String(latestMeasurement.neck) : '');
      setShoulders(latestMeasurement.shoulders ? String(latestMeasurement.shoulders) : '');
      setChest(latestMeasurement.chest ? String(latestMeasurement.chest) : '');
      setBiceps(latestMeasurement.biceps ? String(latestMeasurement.biceps) : '');
      setWaist(latestMeasurement.waist ? String(latestMeasurement.waist) : '');
      setHips(latestMeasurement.hips ? String(latestMeasurement.hips) : '');
      setUpperLeg(latestMeasurement.upperLeg ? String(latestMeasurement.upperLeg) : '');
      setLengthUnit(latestMeasurement.unit || 'cm');
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: Partial<BodyMeasurement> = {
      height: height ? Number(height) : undefined,
      weight: weight ? fromDisplayWeight(Number(weight)) : undefined,
      neck: neck ? Number(neck) : undefined,
      shoulders: shoulders ? Number(shoulders) : undefined,
      chest: chest ? Number(chest) : undefined,
      biceps: biceps ? Number(biceps) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined,
      upperLeg: upperLeg ? Number(upperLeg) : undefined,
      unit: lengthUnit,
      date: new Date().toISOString()
    };

    saveMutation.mutate(payload);
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const photoUrls = [frontPhotoUrl, sidePhotoUrl, backPhotoUrl].filter(Boolean) as string[];

    saveProgressMutation.mutate({
      date: new Date(photoDate).toISOString(),
      weight: photoWeight ? fromDisplayWeight(Number(photoWeight)) : undefined,
      photoUrls
    });
  };

  const bmi = latestMeasurement?.bmi;
  const currentUnit = latestMeasurement?.unit || lengthUnit;

  const getBmiPositionPercent = (val?: number): number => {
    if (!val) return 0;
    const clamped = Math.max(15, Math.min(35, val));
    return ((clamped - 15) / (35 - 15)) * 100;
  };

  // Resolve entries for comparison
  const selectedA = progressEntries.find((p) => p._id === compareIdA || p.id === compareIdA);
  const selectedB = progressEntries.find((p) => p._id === compareIdB || p.id === compareIdB);

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6 space-y-6 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('body.title')}</h2>
          <p className="text-textMuted">{t('body.subtitle')}</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-surfaceElevated rounded-full border border-surfaceElevated self-start">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'measurements'
                ? 'bg-primary text-black shadow-md'
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            {t('body.measurementsTitle')}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-primary text-black shadow-md'
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            <Camera size={14} />
            <span>Photos & Compare</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MEASUREMENTS & BMI */}
      {activeTab === 'measurements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Row */}
          <div className="flex justify-end">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity text-sm"
            >
              <Plus size={18} />
              <span>{t('body.logMeasurements')}</span>
            </button>
          </div>

          {/* Live BMI Gauge Card */}
          <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-textPrimary">{t('body.bmiTitle')}</h3>
              {latestMeasurement?.height && latestMeasurement?.weight && (
                <span className="text-xs text-textMuted font-medium">
                  {latestMeasurement.height} {latestMeasurement.unit === 'in' ? 'in' : 'cm'} ·{' '}
                  {formatWeight(latestMeasurement.weight)}
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
                const rawVal = latestMeasurement
                  ? (latestMeasurement as any)[part === 'legs' ? 'upperLeg' : part]
                  : null;
                const displayVal = rawVal ? `${rawVal} ${currentUnit}` : '--';

                return (
                  <div
                    key={part}
                    onClick={openEditModal}
                    className="flex flex-col justify-between p-3.5 rounded-xl bg-surfaceElevated/60 border border-surfaceElevated hover:border-primary/40 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-semibold text-textMuted">{t(`body.parts.${part}`)}</span>
                    <span
                      className={`text-lg font-black mt-1 ${
                        rawVal ? 'text-textPrimary' : 'text-textMuted/50'
                      }`}
                    >
                      {displayVal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTOS & COMPARISON (BLOCK 4) */}
      {activeTab === 'photos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Row */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-textPrimary">Visual Transformations</h3>
              <p className="text-xs text-textMuted">Log front, side, and back photos with dates</p>
            </div>
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity text-sm"
            >
              <Upload size={16} />
              <span>Upload Progress Photos</span>
            </button>
          </div>

          {/* Weight History Line Chart (Recharts) */}
          {chartData.length > 0 && (
            <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  <h4 className="font-bold text-base text-textPrimary">Weight Progression</h4>
                </div>
                <span className="text-xs text-textMuted">Timeline</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222720" />
                    <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis
                      domain={['dataMin - 2', 'dataMax + 2']}
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161914',
                        borderColor: '#2D3328',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#7CFF3D"
                      strokeWidth={3}
                      dot={{ fill: '#7CFF3D', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 2-Date Side-by-Side Comparison */}
          <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surfaceElevated pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-primary" />
                <h4 className="font-bold text-base text-textPrimary">Side-by-Side Comparison</h4>
              </div>

              {/* Date Selectors */}
              <div className="flex items-center gap-3">
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                >
                  <option value="">Select Date A (Before)</option>
                  {progressEntries.map((entry) => (
                    <option key={entry._id || entry.id} value={entry._id || entry.id}>
                      {new Date(entry.date).toLocaleDateString()} {entry.weight ? `(${formatWeight(entry.weight)})` : ''}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-textMuted font-bold">vs</span>

                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                >
                  <option value="">Select Date B (After)</option>
                  {progressEntries.map((entry) => (
                    <option key={entry._id || entry.id} value={entry._id || entry.id}>
                      {new Date(entry.date).toLocaleDateString()} {entry.weight ? `(${formatWeight(entry.weight)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Viewport */}
            {selectedA && selectedB ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Side A */}
                <div className="bg-surfaceElevated/50 p-4 rounded-xl border border-surfaceElevated space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-primary">
                      {new Date(selectedA.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="font-semibold text-textPrimary">
                      {selectedA.weight ? formatWeight(selectedA.weight) : 'Weight not logged'}
                    </span>
                  </div>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
                    {selectedA.photoUrls && selectedA.photoUrls[0] ? (
                      <img
                        src={selectedA.photoUrls[0]}
                        alt="Progress A"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-textMuted opacity-40" size={36} />
                    )}
                  </div>
                </div>

                {/* Side B */}
                <div className="bg-surfaceElevated/50 p-4 rounded-xl border border-surfaceElevated space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-primary">
                      {new Date(selectedB.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="font-semibold text-textPrimary">
                      {selectedB.weight ? formatWeight(selectedB.weight) : 'Weight not logged'}
                    </span>
                  </div>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/60 flex items-center justify-center">
                    {selectedB.photoUrls && selectedB.photoUrls[0] ? (
                      <img
                        src={selectedB.photoUrls[0]}
                        alt="Progress B"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-textMuted opacity-40" size={36} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-surfaceElevated rounded-xl text-center space-y-2 bg-surfaceElevated/20">
                <Camera className="mx-auto text-textMuted opacity-40" size={36} />
                <p className="text-xs text-textMuted">
                  Select two dates above to view your side-by-side visual physique transformation.
                </p>
              </div>
            )}
          </div>

          {/* Photo Gallery Grid */}
          <div className="bg-surface p-6 rounded-2xl border border-surfaceElevated shadow-lg space-y-4">
            <h4 className="font-bold text-base text-textPrimary">Recent Photos</h4>
            {progressEntries.length === 0 ? (
              <p className="text-xs text-textMuted">No progress photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {progressEntries.flatMap((entry) =>
                  (entry.photoUrls || []).map((url: string, i: number) => (
                    <div
                      key={`${entry._id || entry.id}-${i}`}
                      className="aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-surfaceElevated relative group shadow-md"
                    >
                      <img src={url} alt="Progress" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div>
                <h3 className="text-xl font-black text-textPrimary">Add Progress Photos</h3>
                <p className="text-xs text-textMuted">Piped directly to Cloudinary folder</p>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-textMuted hover:text-textPrimary p-1.5 rounded-lg bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="75.0"
                    value={photoWeight}
                    onChange={(e) => setPhotoWeight(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Photo Angles (Front, Side, Back) */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-textMuted tracking-wider block">
                  Photo Angles
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {(['front', 'side', 'back'] as const).map((angle) => {
                    const url =
                      angle === 'front'
                        ? frontPhotoUrl
                        : angle === 'side'
                        ? sidePhotoUrl
                        : backPhotoUrl;
                    const isUploading = uploadingAngle === angle;

                    return (
                      <div
                        key={angle}
                        className="flex flex-col items-center gap-2 p-3 bg-surfaceElevated/60 border border-surfaceElevated rounded-xl"
                      >
                        <span className="text-xs font-bold capitalize text-textPrimary">{angle}</span>
                        <div className="w-full aspect-[3/4] rounded-lg bg-surface border border-surfaceElevated overflow-hidden flex items-center justify-center relative">
                          {url ? (
                            <img src={url} alt={angle} className="w-full h-full object-cover" />
                          ) : isUploading ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera className="text-textMuted opacity-50" size={24} />
                          )}
                        </div>
                        <label className="cursor-pointer text-[10px] font-bold text-primary hover:underline">
                          <span>{url ? 'Change' : '+ Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoUpload(e.target.files[0], angle);
                              }
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-textMuted hover:text-textPrimary bg-surfaceElevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveProgressMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2 rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 text-xs"
                >
                  {saveProgressMutation.isPending ? 'Saving...' : 'Save Progress Entry'}
                </button>
              </div>
            </form>
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
              <div className="flex items-center justify-between bg-surfaceElevated p-2 rounded-2xl border border-surfaceElevated">
                <span className="text-xs font-bold text-textMuted">{t('body.unit')}</span>
                <div className="flex items-center p-1 bg-surface rounded-full border border-surfaceElevated">
                  <button
                    type="button"
                    onClick={() => setLengthUnit('cm')}
                    className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                      lengthUnit === 'cm'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Metric (cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLengthUnit('in')}
                    className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                      lengthUnit === 'in'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Imperial (in)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">
                    {t('body.height')} ({lengthUnit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={lengthUnit === 'cm' ? '180' : '71'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">
                    {t('body.weight')} ({weightUnit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={weightUnit === 'kg' ? '78' : '172'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BODY_PARTS.map((part) => (
                  <div key={part}>
                    <label className="block text-xs font-medium text-textMuted mb-1">
                      {t(`body.parts.${part}`)}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={
                        part === 'neck'
                          ? neck
                          : part === 'shoulders'
                          ? shoulders
                          : part === 'chest'
                          ? chest
                          : part === 'biceps'
                          ? biceps
                          : part === 'waist'
                          ? waist
                          : part === 'hips'
                          ? hips
                          : upperLeg
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (part === 'neck') setNeck(val);
                        else if (part === 'shoulders') setShoulders(val);
                        else if (part === 'chest') setChest(val);
                        else if (part === 'biceps') setBiceps(val);
                        else if (part === 'waist') setWaist(val);
                        else if (part === 'hips') setHips(val);
                        else setUpperLeg(val);
                      }}
                      className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-textMuted hover:text-textPrimary bg-surfaceElevated"
                >
                  {t('body.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 disabled:opacity-50"
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
