import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, X, AlertTriangle, CheckCircle2, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PaywallModal from './PaywallModal';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface YuriAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkoutId?: string;
  onWorkoutMutated?: (mutatedWorkout: any) => void;
  currentExerciseName?: string;
}

export default function YuriAiDrawer({
  isOpen,
  onClose,
  activeWorkoutId,
  onWorkoutMutated,
  currentExerciseName
}: YuriAiDrawerProps) {
  const { t } = useTranslation();
  const token = localStorage.getItem('yuri_token');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: currentExerciseName
        ? `Hey! I'm Yuri, your personal AI fitness coach. We're currently on "${currentExerciseName}". Need to swap it, shorten your session, or adapt for hotel equipment? Just tap a quick prompt or ask me!`
        : `Hey! I'm Yuri, your AI strength coach. How are you feeling today? Tap a quick adaptation chip below or tell me what to adjust in your workout.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    {
      id: 'shorten_20',
      label: '⚡ Only 20 min',
      prompt: 'I only have 20 minutes today, please shorten my workout and keep the key compound lifts.'
    },
    {
      id: 'swap_hurts',
      label: '🩹 This hurts',
      prompt: currentExerciseName
        ? `My joints hurt doing ${currentExerciseName}. Please swap it with a safer alternative.`
        : 'This exercise hurts my joints. Please substitute it for a safer alternative.'
    },
    {
      id: 'no_gym',
      label: '🏨 No gym today',
      prompt: 'I do not have access to a gym today. Please adapt this workout for dumbbells or bodyweight only.'
    },
    {
      id: 'more_intense',
      label: '💪 More intense',
      prompt: 'I feel energetic today! Make this workout a bit more challenging with extra target volume.'
    }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          activeWorkoutId: activeWorkoutId || 'temp_session',
          message: userText
        })
      });

      const data = await res.json();

      if (res.status === 403 && data.error === 'PAYWALL_TRIGGER') {
        setPaywallReason(data.message);
        setPaywallOpen(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⭐ Real-time Yuri AI workout mutations are a Yuri Pro feature. Upgrade to Pro with a 7-day free trial to unlock unlimited live adjustments!'
          }
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process AI response');
      }

      // Append assistant reply
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "I've updated your workout routine according to your request!"
        }
      ]);

      // If workout was mutated, trigger callback to update parent state
      if (data.workout && onWorkoutMutated) {
        onWorkoutMutated(data.workout);
      }
    } catch (err: any) {
      console.error('[Yuri AI Drawer Error]', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I had trouble adjusting that. Please check your connection or try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Backdrop click */}
        <div className="flex-1 cursor-pointer" onClick={onClose} />

        {/* Drawer Container */}
        <div className="w-full max-w-md bg-surface border-l border-surfaceElevated h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-surfaceElevated flex items-center justify-between bg-surfaceElevated/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(124,255,61,0.25)]">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-textPrimary text-base tracking-tight">Yuri AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    Live Coach
                  </span>
                </div>
                <p className="text-xs text-textMuted">Adaptive workout mutations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-textMuted hover:text-textPrimary bg-surfaceElevated hover:bg-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-3 border-b border-surfaceElevated/60 bg-surface/80">
            <span className="text-[10px] font-bold uppercase text-textMuted tracking-wider block mb-2">
              Quick Adjustments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {promptChips.map((chip) => (
                <button
                  key={chip.id}
                  disabled={loading}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-surfaceElevated hover:bg-primary/20 hover:text-primary hover:border-primary/40 text-textPrimary border border-surfaceElevated transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-black font-medium rounded-tr-none shadow-md'
                      : 'bg-surfaceElevated border border-surfaceElevated text-textPrimary rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-primary text-xs font-medium bg-surfaceElevated/60 p-3 rounded-xl w-fit border border-surfaceElevated">
                <RefreshCw size={14} className="animate-spin" />
                <span>Yuri is analyzing and adapting your workout...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-surfaceElevated bg-surface">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Yuri to adjust, shorten, or swap..."
                disabled={loading}
                className="flex-1 bg-surfaceElevated border border-surfaceElevated rounded-xl px-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="bg-primary text-black font-bold p-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-[0_0_12px_rgba(124,255,61,0.25)] shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stripe Paywall Modal if triggered */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
        onUpgraded={() => {
          setPaywallOpen(false);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: '🎉 Welcome to Yuri Pro! You now have unlimited AI workout mutations and routines unlocked.'
            }
          ]);
        }}
      />
    </>
  );
}
