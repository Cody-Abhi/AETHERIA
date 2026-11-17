'use client';

import { Sparkles, UserCheck, Volume2, VolumeX } from 'lucide-react';
import { DAILY_THOUGHT_LIMIT } from '@/lib/aetheria';

interface TopHeaderProps {
  remainingThoughts: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userHandle: string | null;
  userName: string | null;
  onEditName: () => void;
}

export function TopHeader({
  remainingThoughts,
  soundEnabled,
  onToggleSound,
  userHandle,
  userName,
  onEditName,
}: TopHeaderProps) {
  const isExhausted = remainingThoughts === 0;

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-8 sm:py-3.5"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.38)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 8px 32px rgba(140, 150, 200, 0.12)',
      }}
    >
      {/* Left: Frosted Bubble-Morphic Sound Toggle */}
      <div className="flex shrink-0 items-center justify-start sm:min-w-0 sm:flex-1">
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          style={{
            boxShadow: soundEnabled
              ? 'inset 0 4px 10px rgba(255, 255, 255, 0.9), inset 0 -4px 10px rgba(180, 210, 255, 0.42), 0 6px 20px rgba(140, 150, 200, 0.16)'
              : 'inset 0 2px 6px rgba(255, 255, 255, 0.75), 0 4px 14px rgba(140, 150, 200, 0.12)',
          }}
          className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-full border border-white/85 bg-white/55 text-slate-700 backdrop-blur-xl transition-all duration-200 hover:bg-white/80 hover:text-slate-900 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:min-h-[44px] sm:min-w-[44px]"
        >
          {soundEnabled ? (
            <Volume2 className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <VolumeX className="h-[18px] w-[18px] text-slate-400" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Center: Serif Brand Title with Subtle White Glow */}
      <div className="flex shrink-0 items-center justify-center">
        <h1
          className="font-serif text-[17px] font-semibold tracking-[0.14em] text-slate-800 select-none sm:text-[28px] sm:tracking-[0.26em]"
          style={{
            textShadow: '0 0 18px rgba(255, 255, 255, 0.95), 0 1px 2px rgba(255, 255, 255, 0.85)',
          }}
        >
          AETHERIA
        </h1>
      </div>

      {/* Right: User Name / Handle Pill & Live Quota Badge */}
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:min-w-0 sm:flex-1 sm:gap-2.5">
        {userHandle ? (
          <>
            <button
              type="button"
              onClick={onEditName}
              title={`Click to change name (${userName || userHandle})`}
              data-testid="user-handle-badge"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow:
                  'inset 0 2px 6px rgba(255, 255, 255, 0.92), 0 6px 20px rgba(140, 150, 200, 0.14)',
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-xl transition-all hover:bg-white/85 hover:text-slate-900 active:scale-95"
            >
              <UserCheck className="h-3.5 w-3.5 text-violet-600" />
              <span>{userHandle}</span>
            </button>

            <div
              data-testid="daily-quota-badge"
              aria-live="polite"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow:
                  'inset 0 2px 6px rgba(255, 255, 255, 0.92), 0 6px 20px rgba(140, 150, 200, 0.14)',
              }}
              className={`flex items-center rounded-full px-2.5 py-1.5 text-[10.5px] font-medium tracking-tight tabular-nums whitespace-nowrap backdrop-blur-xl transition-colors sm:px-4 sm:py-2 sm:text-xs ${
                isExhausted
                  ? 'bg-rose-50/65 text-slate-600'
                  : 'bg-white/62 text-slate-700'
              }`}
            >
              <span className="font-semibold text-slate-900">{remainingThoughts}</span>
              <span className="mx-0.5 text-slate-400 sm:mx-1">/</span>
              <span>{DAILY_THOUGHT_LIMIT}</span>
              <span className="ml-1 hidden sm:inline">Thoughts Left Today</span>
              <span className="ml-1 sm:hidden">Left</span>
            </div>
          </>
        ) : (
          <button
            type="button"
            data-testid="enter-name-button"
            onClick={onEditName}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.88)',
              boxShadow:
                'inset 0 2px 8px rgba(255, 255, 255, 0.94), 0 6px 20px rgba(140, 150, 200, 0.16)',
            }}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-800 backdrop-blur-xl transition-all hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:min-h-[42px] sm:gap-2 sm:px-4 sm:py-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
            <span>Enter Your Name</span>
          </button>
        )}
      </div>
    </header>
  );
}
