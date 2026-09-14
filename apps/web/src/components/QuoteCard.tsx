import React from 'react';
import { CINEMATIC_ASSETS } from '../utils/imagePipeline';

const QUOTES = [
  {
    quote: 'Discipline is the bridge between your goals and your freedom.',
    author: 'YURI'
  },
  {
    quote: 'The body achieves what the mind believes.',
    author: 'YURI'
  },
  {
    quote: 'Small daily disciplines compound into massive transformations.',
    author: 'YURI'
  },
  {
    quote: 'Consistency isn’t about perfection; it’s about never quitting.',
    author: 'YURI'
  }
];

interface QuoteCardProps {
  photoUrl?: string;
  quoteIndex?: number;
}

export default function QuoteCard({
  photoUrl = CINEMATIC_ASSETS.QUOTE_MOUNTAIN,
  quoteIndex = 0
}: QuoteCardProps) {
  const selectedQuote = QUOTES[quoteIndex % QUOTES.length];

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-surfaceElevated overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-xl min-h-[190px] group">
      {/* Background Image with Dark Vignette Overlay */}
      <img
        src={photoUrl}
        alt="Inspirational Background"
        className="absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-125 brightness-50 group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
      />
      {/* Dark gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-primary/5 mix-blend-color-dodge pointer-events-none" />

      {/* Quote Icon */}
      <div className="relative z-10 text-primary font-serif text-4xl sm:text-5xl leading-none select-none drop-shadow-[0_0_8px_rgba(116,145,118,0.25)]">
        “
      </div>

      {/* Quote Text & Attribution */}
      <div className="relative z-10 mt-3 space-y-2">
        <p className="text-sm sm:text-base italic font-medium text-textPrimary leading-relaxed">
          {selectedQuote.quote}
        </p>
        <span className="text-xs font-black tracking-widest text-textMuted uppercase block">
          — {selectedQuote.author}
        </span>
      </div>
    </div>
  );
}
