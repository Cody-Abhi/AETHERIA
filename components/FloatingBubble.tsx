'use client';

import { forwardRef } from 'react';
import { EmotionIcon } from '@/components/EmotionIcon';
import {
  EMOTION_CONFIG,
  type BurstDroplet,
  type ThoughtBubbleData,
} from '@/lib/aetheria';

interface FloatingBubbleProps {
  bubble: ThoughtBubbleData;
  displaySize: number;
  isPopping: boolean;
  isHidden: boolean;
  droplets: BurstDroplet[];
  onPop: (bubble: ThoughtBubbleData) => void;
  onHoverChange: (id: string, hovered: boolean) => void;
}

export const FloatingBubble = forwardRef<HTMLDivElement, FloatingBubbleProps>(
  function FloatingBubble(
    { bubble, displaySize, isPopping, isHidden, droplets, onPop, onHoverChange },
    ref
  ) {
    const emotionMeta = EMOTION_CONFIG[bubble.emotion];
    const size = displaySize;

    return (
      <div
        ref={ref}
        data-testid={`bubble-${bubble.id}`}
        className={`absolute top-0 left-0 will-change-transform ${
          isHidden && !isPopping ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        style={{
          width: `${size}px`,
          marginLeft: `${-size / 2}px`,
          marginTop: `${-size / 2}px`,
          transition: isHidden ? 'opacity 220ms ease' : undefined,
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Interactive 3D Iridescent Soap Bubble */}
          <button
            type="button"
            onClick={() => onPop(bubble)}
            onMouseEnter={() => onHoverChange(bubble.id, true)}
            onMouseLeave={() => onHoverChange(bubble.id, false)}
            onFocus={() => onHoverChange(bubble.id, true)}
            onBlur={() => onHoverChange(bubble.id, false)}
            disabled={isPopping || isHidden}
            aria-label={`Pop bubble from @${bubble.username} feeling ${bubble.emotion}`}
            className="soap-bubble-surface group relative flex cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transform: isPopping ? 'scale3d(1.18, 1.18, 1)' : 'scale3d(1, 1, 1)',
              opacity: isPopping ? 0 : 1,
              transition: isPopping
                ? 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), opacity 130ms ease-out'
                : 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease',
              boxShadow: `
                inset 0 6px 16px rgba(255, 255, 255, 0.92),
                inset 0 -8px 18px rgba(180, 210, 255, 0.44),
                inset 0 0 24px ${emotionMeta.rimGlow},
                0 0 35px ${emotionMeta.outerHalo},
                0 8px 24px rgba(120, 130, 180, 0.14)
              `,
            }}
          >
            {/* Subtle Rainbow Chromatic Aberration Along Inner Edge */}
            <span
              aria-hidden="true"
              className="chromatic-bubble-rim pointer-events-none absolute inset-[2px] rounded-full opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />

            {/* Emotion-tinted Iridescent Inner Film */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[3px] rounded-full opacity-65 transition-opacity duration-300 group-hover:opacity-95"
              style={{
                background: emotionMeta.iridescentArc,
              }}
            />

            {/* Glossy Top-Left White Crescent Specular Reflection */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[10%] left-[14%] h-[26%] w-[44%] -rotate-28 rounded-full opacity-95"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.72) 48%, rgba(255, 255, 255, 0) 78%)',
              }}
            />

            {/* Secondary Crisp Specular Glint */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[29%] left-[13%] h-[8%] w-[8%] rounded-full bg-white/95 blur-[0.4px]"
            />

            {/* Delicate Bottom-Right Iridescent Bounce Reflection */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[7%] rounded-full border-r-[2.5px] border-b-[2.5px] border-transparent opacity-60 blur-[1px]"
              style={{
                borderRightColor: emotionMeta.colorHex,
                borderBottomColor: 'rgba(255, 255, 255, 0.9)',
              }}
            />

            {/* Suspended Core Emotion Emblem */}
            <span
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/45 shadow-[inset_0_1px_3px_rgba(255,255,255,0.92)] transition-transform duration-200 group-hover:scale-110"
              style={{ color: emotionMeta.colorHex }}
            >
              <EmotionIcon emotion={bubble.emotion} className="h-4 w-4 stroke-[1.9]" />
            </span>
          </button>

          {/* Water-Droplet Shatter Particles (Stage 2 Pop) */}
          {isPopping && droplets.length > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 flex items-center justify-center"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              {droplets.map((d) => (
                <span
                  key={d.id}
                  className="animate-droplet-scatter absolute rounded-full border border-white/85"
                  style={
                    {
                      width: `${d.size}px`,
                      height: `${d.size}px`,
                      background: `radial-gradient(circle at 30% 30%, #FFFFFF, ${d.color})`,
                      boxShadow: `0 0 10px ${d.color}`,
                      animationDelay: `${d.delayMs}ms`,
                      '--dx': `${d.dx}px`,
                      '--dy': `${d.dy}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          {/* Crisp Floating White Frosted Pill Below Bubble */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
            }}
            className={`mt-2 flex items-center gap-1.5 rounded-full border border-white/85 px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap text-slate-700 transition-opacity duration-150 sm:mt-2.5 sm:py-1 sm:text-[11px] ${
              isPopping ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span
              aria-hidden="true"
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8.5px] font-semibold text-white uppercase shadow-xs sm:h-4 sm:w-4 sm:text-[9px]"
              style={{ backgroundColor: emotionMeta.dotColor }}
            >
              {bubble.username.slice(0, 1)}
            </span>
            <span className="text-slate-800">@{bubble.username}</span>
            <span aria-hidden="true" className="text-slate-400">
              -
            </span>
            <span className="text-slate-600">{bubble.emotion}</span>
          </div>
        </div>
      </div>
    );
  }
);
