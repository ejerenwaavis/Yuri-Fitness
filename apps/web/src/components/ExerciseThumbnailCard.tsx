import React from 'react';
import { Play } from 'lucide-react';
import { getDuotoneImageUrl, CINEMATIC_ASSETS } from '../utils/imagePipeline';

interface ExerciseThumbnailCardProps {
  index: number;
  name: string;
  targetSets?: number;
  targetReps?: number;
  mediaUrl?: string;
  onClick?: () => void;
}

export default function ExerciseThumbnailCard({
  index,
  name,
  targetSets = 3,
  targetReps = 10,
  mediaUrl,
  onClick
}: ExerciseThumbnailCardProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');
  const imageUrl = getDuotoneImageUrl(mediaUrl, CINEMATIC_ASSETS.EXERCISE_PLACEHOLDER);

  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-2xl border border-surfaceElevated overflow-hidden hover:border-primary/50 transition-all flex flex-col group cursor-pointer shadow-lg"
    >
      {/* Exercise Image Frame with Duotone Mood */}
      <div className="relative aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Dark duotone gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-color pointer-events-none" />

        {/* Numbered Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-primary font-black text-xs px-2.5 py-1 rounded-lg border border-primary/30 shadow-md">
          {formattedIndex}
        </div>

        {/* Play icon overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_15px_rgba(124,255,61,0.6)] scale-90 group-hover:scale-100 transition-transform">
            <Play size={18} fill="currentColor" className="translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <h4 className="font-bold text-sm sm:text-base text-textPrimary group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h4>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surfaceElevated text-xs font-semibold text-textMuted">
          <span>{targetSets} sets</span>
          <span className="text-primary font-bold">{targetReps} reps</span>
        </div>
      </div>
    </div>
  );
}
