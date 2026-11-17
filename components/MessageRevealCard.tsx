'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X } from 'lucide-react';
import { EmotionIcon } from '@/components/EmotionIcon';
import {
  EMOTION_CONFIG,
  getRemainingThoughtMinutes,
  type ThoughtBubbleData,
} from '@/lib/aetheria';

interface MessageRevealCardProps {
  bubble: ThoughtBubbleData | null;
  onClose: () => void;
  onSendWarmth: (bubbleId: string) => void;
}

export function MessageRevealCard({
  bubble,
  onClose,
  onSendWarmth,
}: MessageRevealCardProps) {
  useEffect(() => {
    if (!bubble) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bubble, onClose]);

  return (
    <AnimatePresence>
      {bubble && (
        <motion.div
          key="reveal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/12 px-4 backdrop-blur-[6px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revealed-thought-text"
        >
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0.86, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-[480px] items-center justify-center"
          >
            {/* Faint Dissolving Bubble Halo Framing the Card */}
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0.72, opacity: 0.75 }}
              animate={{ scale: 1.06, opacity: 0.42 }}
              exit={{ scale: 1.12, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute -inset-6 rounded-[44px] border border-white/65 blur-[1px] sm:-inset-8"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.05) 68%, transparent 100%)',
                boxShadow: `0 0 56px ${EMOTION_CONFIG[bubble.emotion].outerHalo}, inset 0 0 28px rgba(255, 255, 255, 0.55)`,
              }}
            />

            {/* Thick Translucent Frosted-Glass Message Card */}
            <div
              className="relative w-full overflow-hidden p-6 sm:p-8"
              style={{
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                background: 'rgba(255, 255, 255, 0.55)',
                border: '1.5px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '28px',
                boxShadow: `0 24px 64px rgba(100, 116, 139, 0.18), 0 0 40px ${EMOTION_CONFIG[bubble.emotion].rimGlow}, inset 0 2px 6px rgba(255, 255, 255, 0.92)`,
              }}
            >
              {/* Soft Corner Specular Sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-35 blur-3xl"
                style={{ backgroundColor: EMOTION_CONFIG[bubble.emotion].colorHex }}
              />

              {/* Top Author Lockup & Close Action */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white uppercase shadow-xs"
                    style={{ backgroundColor: EMOTION_CONFIG[bubble.emotion].dotColor }}
                  >
                    {bubble.username.slice(0, 1)}
                  </span>
                  <span className="text-xs font-semibold text-[#1E2433]">
                    @{bubble.username}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-white/90 hover:text-slate-900 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>

              {/* Message in Crisp Dark Charcoal Cormorant Garamond */}
              <blockquote
                id="revealed-thought-text"
                className="relative z-10 mt-6 mb-6 font-serif text-[23px] leading-[1.5] font-medium text-[#1E2433] sm:text-[26px]"
              >
                “{bubble.message}”
              </blockquote>

              {/* Warmth Reaction Pill (One-way +1 increment aligned with Firestore rule) */}
              <div className="relative z-10 mb-5 flex items-center">
                <button
                  type="button"
                  data-testid="send-warmth-button"
                  aria-pressed={Boolean(bubble.warmthSent)}
                  disabled={Boolean(bubble.warmthSent)}
                  onClick={() => onSendWarmth(bubble.id)}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${
                    bubble.warmthSent
                      ? 'cursor-default border-amber-300/90 bg-amber-50/90 text-amber-800 shadow-[0_6px_18px_rgba(251,191,36,0.24)]'
                      : 'cursor-pointer border-white/85 bg-white/75 text-[#1E2433] shadow-xs hover:bg-white active:scale-95'
                  }`}
                >
                  <span>{bubble.warmthSent ? 'Warmth Sent ✨' : 'Send Warmth ✨'}</span>
                  <span data-testid="warmth-count" className="ml-0.5 tabular-nums text-slate-500">
                    ({bubble.warmthCount})
                  </span>
                </button>
              </div>

              {/* Bottom Metadata Row: Colored Emotion Pill, Timestamp & AETHERIA Watermark */}
              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/70 pt-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${EMOTION_CONFIG[bubble.emotion].badgeBg} ${EMOTION_CONFIG[bubble.emotion].badgeText} ${EMOTION_CONFIG[bubble.emotion].badgeBorder}`}
                  >
                    <EmotionIcon emotion={bubble.emotion} className="h-3.5 w-3.5" />
                    <span>{bubble.emotion}</span>
                  </span>

                  <span className="text-xs font-medium text-slate-600 tabular-nums">
                    {bubble.timestamp}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/70 px-2 py-0.5 text-[10.5px] font-medium text-slate-500 tabular-nums">
                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                    <span>
                      {bubble.createdAtMs
                        ? `${getRemainingThoughtMinutes(bubble.createdAtMs)}m left`
                        : 'Sample Thought'}
                    </span>
                  </span>
                </div>

                <span className="font-serif text-[11px] font-semibold tracking-[0.24em] text-slate-500/80 select-none">
                  AETHERIA
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
