import React from 'react';
import { CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { CINEMATIC_ASSETS } from '../utils/imagePipeline';

interface MembershipCardProps {
  subscriptionStatus?: string;
  onUpgrade?: () => void;
  photoUrl?: string;
}

export default function MembershipCard({
  subscriptionStatus = 'free',
  onUpgrade,
  photoUrl = CINEMATIC_ASSETS.PROFILE_HERO
}: MembershipCardProps) {
  const isPro = subscriptionStatus === 'pro' || subscriptionStatus === 'active';

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-surfaceElevated bg-surface overflow-hidden p-6 sm:p-7 shadow-xl flex flex-col justify-between group">
      {/* Photo bleed on the right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <img
          src={photoUrl}
          alt="Membership Background"
          className="w-full h-full object-cover object-center filter grayscale contrast-150"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Top Header: Icon + Title + Tier Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surfaceElevated/80 border border-surfaceElevated flex items-center justify-center text-primary shadow-sm">
              <CreditCard size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-textPrimary tracking-tight">
              Membership Plan
            </h3>
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all ${
              isPro
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-surfaceElevated/70 text-textMuted border-surfaceElevated'
            }`}
          >
            {isPro ? 'Pro Active' : 'Free Tier'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-textMuted leading-relaxed max-w-sm mb-5">
          {isPro
            ? 'You have unlimited access to Yuri AI mutations, custom workouts, and progress charts.'
            : 'Upgrade to Yuri Pro for unlimited AI adaptations and customized workouts.'}
        </p>
      </div>

      {/* CTA Button */}
      <div className="relative z-10">
        <button
          onClick={onUpgrade}
          className="w-full inline-flex items-center justify-center gap-2 bg-black/30 hover:bg-primary/15 text-primary border border-primary/50 hover:border-primary font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all active:scale-[0.98] shadow-sm"
        >
          {isPro ? (
            <>
              <span>Manage Subscription</span>
              <ArrowRight size={15} />
            </>
          ) : (
            <>
              <span>Upgrade to Pro</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
