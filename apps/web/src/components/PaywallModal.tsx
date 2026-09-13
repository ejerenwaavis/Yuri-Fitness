import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Check, Zap, ShieldCheck } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  reason?: string;
  onUpgraded?: () => void;
}

export default function PaywallModal({
  isOpen,
  onClose,
  title,
  subtitle,
  reason,
  onUpgraded
}: PaywallModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('yuri_token');
      const res = await fetch('/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('yuri_token');
      await fetch('/stripe/simulate-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ targetStatus: 'pro' })
      });
      if (onUpgraded) {
        onUpgraded();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface border border-primary/40 rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(124,255,61,0.15)] space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surfaceElevated text-textMuted hover:text-textPrimary transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black tracking-wider uppercase">
            <Sparkles size={13} />
            <span>Yuri Pro Tier</span>
          </div>
          <h3 className="text-2xl font-black text-textPrimary tracking-tight">
            {title || 'Unlock Full Yuri AI Power'}
          </h3>
          <p className="text-xs text-textMuted max-w-xs mx-auto">
            {reason || subtitle || 'Get unlimited live routine adjustments, injury substitutions, and custom training sessions.'}
          </p>
        </div>

        {/* Pro vs Free Comparison */}
        <div className="space-y-3 bg-surfaceElevated/60 p-4 rounded-2xl border border-surfaceElevated text-xs">
          <div className="flex items-center gap-3 text-textPrimary font-bold pb-2 border-b border-surfaceElevated">
            <Zap size={16} className="text-primary shrink-0" />
            <span>Everything in Yuri Pro:</span>
          </div>
          <ul className="space-y-2 text-textMuted">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-primary shrink-0" />
              <span>Unlimited Yuri AI in-workout exercise swaps</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-primary shrink-0" />
              <span>Unlimited generated workout routines & volume scaling</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-primary shrink-0" />
              <span>Side-by-side progress photo comparison & trends</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-primary shrink-0" />
              <span>Emergency routines ("Hotel", "20 min", "Joint pain")</span>
            </li>
          </ul>
        </div>

        {/* Price & CTA */}
        <div className="space-y-3 pt-1">
          <div className="text-center">
            <span className="text-2xl font-black text-textPrimary">$12.99</span>
            <span className="text-xs text-textMuted"> / month</span>
            <div className="text-[11px] text-primary font-bold mt-0.5">
              Includes 7-Day Free Trial · Cancel Anytime
            </div>
          </div>

          <button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full bg-primary text-black font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(124,255,61,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Start 7-Day Free Trial</span>
              </>
            )}
          </button>

          {/* Test button for instant simulation on staging */}
          <button
            type="button"
            onClick={handleSimulateUpgrade}
            className="w-full text-center text-[11px] text-textMuted hover:text-primary transition-colors underline pt-1"
          >
            [Dev/Staging] Simulate Instant Pro Activation
          </button>
        </div>
      </div>
    </div>
  );
}
