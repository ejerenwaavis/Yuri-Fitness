import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Search, Trash2, X, Film, Dumbbell, Flame, CheckCircle, AlertCircle } from 'lucide-react';
import type { ExerciseInstruction } from '@yuri/shared';
import { AuthContext } from '../App';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

export default function ExerciseLibrary() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<ExerciseInstruction | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload modal form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chest');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [targetMuscles, setTargetMuscles] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch exercises query
  const { data: exercises = [], isLoading } = useQuery<ExerciseInstruction[]>({
    queryKey: ['exercises', selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await fetch(`/api/exercises?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch exercises');
      return res.json();
    }
  });

  // Delete exercise mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('yuri_token');
      const res = await fetch(`/api/exercises/${id}`, { 
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete exercise');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });

  const handleDelete = (id?: string) => {
    if (!id) return;
    if (window.confirm(t('exercises.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!videoFile) {
      setErrorMessage(t('exercises.selectVideo'));
      return;
    }
    if (!name.trim() || !description.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem('yuri_token');
      // 1. Upload video file to /api/exercises/upload (pipes to Cloudinary)
      const formData = new FormData();
      formData.append('video', videoFile);

      const uploadRes = await fetch('/api/exercises/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || t('exercises.videoFailed'));
      }

      const uploadData = await uploadRes.json();
      const { videoUrl, publicId, thumbnailUrl } = uploadData;

      // 2. Save exercise instruction record to DB
      const saveRes = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          difficulty,
          targetMuscles: targetMuscles.split(',').map(m => m.trim()).filter(Boolean),
          description: description.trim(),
          videoUrl,
          thumbnailUrl,
          cloudinaryPublicId: publicId
        })
      });

      if (!saveRes.ok) {
        throw new Error(t('exercises.saveFailed'));
      }

      // Reset form & close modal
      setName('');
      setDescription('');
      setTargetMuscles('');
      setVideoFile(null);
      setIsUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while saving exercise');
    } finally {
      setIsUploading(false);
    }
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'beginner': return 'bg-primary/20 text-primary border-primary/40';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-surfaceElevated text-textMuted border-surfaceElevated';
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-4">
      {/* Header & Upload Button (Admin Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('exercises.title')}</h2>
          <p className="text-sm text-textMuted">{t('exercises.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setErrorMessage(null); setIsUploadOpen(true); }}
            className="flex items-center justify-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity text-sm"
          >
            <Plus size={20} />
            <span>{t('exercises.adminUpload')}</span>
          </button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input
            type="text"
            placeholder={t('exercises.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-surfaceElevated rounded-lg pl-10 pr-4 py-2.5 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(124,255,61,0.3)]'
                  : 'bg-surface text-textMuted border border-surfaceElevated hover:text-textPrimary'
              }`}
            >
              {cat === 'All' ? t('exercises.all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-textMuted">{t('workouts.loading')}</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-surfaceElevated space-y-3">
          <Film className="mx-auto text-textMuted opacity-50" size={48} />
          <p className="text-textMuted font-medium">{t('exercises.noExercises')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exercises.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className="bg-surface rounded-xl border border-surfaceElevated overflow-hidden hover:border-primary/50 transition-all flex flex-col group shadow-lg"
              >
                {/* Video Preview / Poster */}
                <div
                  className="relative aspect-video bg-black/60 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => setActiveVideo(item)}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={item.videoUrl}
                      className="w-full h-full object-cover pointer-events-none opacity-80"
                      preload="metadata"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="bg-primary/90 text-black p-3.5 rounded-full shadow-[0_0_20px_rgba(124,255,61,0.6)] group-hover:scale-110 transition-transform">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {item.category}
                      </span>
                      {item.difficulty && (
                        <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}>
                          {t(`exercises.${item.difficulty}`)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-textPrimary line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-textMuted line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Target Muscles tags */}
                  {item.targetMuscles && item.targetMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.targetMuscles.slice(0, 3).map((muscle, idx) => (
                        <span key={idx} className="text-xs bg-surfaceElevated px-2.5 py-0.5 rounded-md text-textMuted font-medium">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-surfaceElevated">
                    <button
                      onClick={() => setActiveVideo(item)}
                      className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Play size={16} fill="currentColor" /> {t('exercises.watchGuide')}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-textMuted hover:text-red-400 p-1 rounded transition-colors"
                        title={t('exercises.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surfaceElevated">
              <div>
                <h3 className="font-bold text-lg text-textPrimary">{activeVideo.name}</h3>
                <span className="text-xs text-primary font-medium">{activeVideo.category}</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-textMuted hover:text-textPrimary p-2 rounded-lg bg-surfaceElevated transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Details & Form Cues */}
            <div className="p-5 space-y-4 max-h-60 overflow-y-auto">
              {activeVideo.targetMuscles && activeVideo.targetMuscles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-textMuted">{t('exercises.targetMuscles')}:</span>
                  {activeVideo.targetMuscles.map((muscle, idx) => (
                    <span key={idx} className="text-xs bg-surfaceElevated text-primary font-medium px-2 py-0.5 rounded-full border border-surfaceElevated">
                      {muscle}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-textPrimary mb-1">{t('exercises.description')}</h4>
                <p className="text-sm text-textMuted whitespace-pre-line leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Video Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div>
                <h3 className="text-xl font-black text-textPrimary">{t('exercises.uploadModalTitle')}</h3>
                <p className="text-xs text-textMuted">{t('exercises.uploadModalSubtitle')}</p>
              </div>
              <button
                disabled={isUploading}
                onClick={() => setIsUploadOpen(false)}
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

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Exercise Name */}
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.exerciseName')} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('exercises.exerciseNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category & Difficulty Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.category')} *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.difficulty')}</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    disabled={isUploading}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  >
                    <option value="beginner">{t('exercises.beginner')}</option>
                    <option value="intermediate">{t('exercises.intermediate')}</option>
                    <option value="advanced">{t('exercises.advanced')}</option>
                  </select>
                </div>
              </div>

              {/* Target Muscles */}
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.targetMuscles')}</label>
                <input
                  type="text"
                  placeholder={t('exercises.targetMusclesPlaceholder')}
                  value={targetMuscles}
                  onChange={(e) => setTargetMuscles(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description & Cues */}
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.description')} *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={t('exercises.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Video File Picker */}
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">{t('exercises.selectVideo')} *</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  required
                  disabled={isUploading}
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-textMuted file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:opacity-90 cursor-pointer"
                />
                {videoFile && (
                  <p className="text-[11px] text-primary mt-1">
                    ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceElevated">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-textMuted hover:text-textPrimary bg-surfaceElevated transition-colors"
                >
                  {t('exercises.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{t('exercises.uploading')}</span>
                    </>
                  ) : (
                    <span>{t('exercises.save')}</span>
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
