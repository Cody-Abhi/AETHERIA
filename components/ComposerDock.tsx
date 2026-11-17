'use client';

import { useState, type FormEvent } from 'react';
import { EmotionIcon } from '@/components/EmotionIcon';
import {
  EMOTION_CONFIG,
  EMOTION_LIST,
  MAX_THOUGHT_LENGTH,
  validateThoughtInput,
  type EmotionType,
} from '@/lib/aetheria';

interface ComposerDockProps {
  userName: string | null;
  isSubmitting: boolean;
  remainingThoughts: number;
  statusError: string | null;
  onPromptName: () => void;
  onRelease: (message: string, emotion: EmotionType) => Promise<boolean>;
  onSelectEmotion?: (emotion: EmotionType) => void;
}

export function ComposerDock({
  userName,
  isSubmitting,
  remainingThoughts,
  statusError,
  onPromptName,
  onRelease,
  onSelectEmotion,
}: ComposerDockProps) {
  const [text, setText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Calm');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasName = Boolean(userName && userName.trim().length > 0);
  const isLimitReached = remainingThoughts <= 0;
  const isInputDisabled = isLimitReached || isSubmitting;
  const isButtonDisabled = isLimitReached || isSubmitting || (hasName && !text.trim());

  const handleEmotionClick = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
    onSelectEmotion?.(emotion);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasName) {
      onPromptName();
      return;
    }
    if (isLimitReached || isSubmitting) return;

    const validation = validateThoughtInput(text);
    if (!validation.valid) {
      setErrorMessage(validation.error ?? 'Please write a thought first.');
      return;
    }

    setErrorMessage(null);
    const ok = await onRelease(validation.trimmed, selectedEmotion);
    if (ok) {
      setText('');
    }
  };

  const handleInputClick = () => {
    if (!hasName) {
      onPromptName();
    }
  };

  const displayError = errorMessage || statusError;

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-30 flex justify-center px-3 pb-4 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto w-full max-w-[740px]">
        {isLimitReached && (
          <div
            data-testid="daily-limit-reached"
            role="status"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.88)',
              boxShadow: '0 8px 24px rgba(120, 130, 180, 0.14)',
            }}
            className="mx-auto mb-2.5 w-fit rounded-full px-5 py-2 text-center"
          >
            <p className="text-xs font-medium text-slate-700 sm:text-sm">
              You&apos;ve shared your 5 thoughts for today. Return tomorrow.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.48)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow:
              '0 12px 36px rgba(120, 130, 180, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          }}
          className="flex flex-col gap-2 rounded-[26px] p-2 sm:flex-row sm:items-center sm:gap-2.5 sm:rounded-full sm:py-1.5 sm:pr-1.5 sm:pl-5"
        >
          {/* Left: Text Input + Character Counter */}
          <div className="flex flex-1 items-center gap-2 px-2.5 sm:px-0">
            <input
              type="text"
              value={text}
              disabled={isInputDisabled}
              onClick={handleInputClick}
              onChange={(e) => {
                if (!hasName) {
                  onPromptName();
                  return;
                }
                setText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={MAX_THOUGHT_LENGTH}
              placeholder={
                !hasName
                  ? 'First write your name, then share your thoughts...'
                  : isLimitReached
                  ? "You've shared your 5 thoughts for today. Return tomorrow."
                  : `What's on your mind, ${userName}?`
              }
              aria-label="What's on your mind?"
              className="min-h-[38px] w-full bg-transparent text-sm text-[#1E2433] placeholder:text-slate-500/80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            />
            {hasName && !isLimitReached && (
              <span
                aria-label={`${text.length} of ${MAX_THOUGHT_LENGTH} characters`}
                className={`shrink-0 text-[11px] tabular-nums ${
                  text.length >= MAX_THOUGHT_LENGTH ? 'font-medium text-rose-500' : 'text-slate-500/75'
                }`}
              >
                {text.length}/{MAX_THOUGHT_LENGTH}
              </span>
            )}
          </div>

          {/* Middle & Right: 5 Minimal Emotion Icons + Glossy Gradient Release Button */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div
              className="flex items-center gap-0.5 sm:gap-1"
              role="group"
              aria-label="Select emotion"
            >
              {EMOTION_LIST.map((emotion) => {
                const meta = EMOTION_CONFIG[emotion];
                const isActive = selectedEmotion === emotion;
                return (
                  <button
                    key={emotion}
                    type="button"
                    disabled={isLimitReached}
                    onClick={() => handleEmotionClick(emotion)}
                    aria-label={`Emotion: ${emotion}`}
                    aria-pressed={isActive}
                    title={emotion}
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:h-9 sm:w-9 ${
                      isActive
                        ? 'scale-105 border-white bg-white/90'
                        : 'border-transparent bg-transparent text-slate-600/80 hover:bg-white/55 hover:text-slate-800'
                    }`}
                    style={
                      isActive
                        ? {
                            color: meta.colorHex,
                            boxShadow: `0 4px 14px ${meta.outerHalo}`,
                          }
                        : undefined
                    }
                  >
                    <EmotionIcon emotion={emotion} className="h-4 w-4 stroke-[1.75]" />
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              data-testid="release-bubble-button"
              disabled={isButtonDisabled}
              style={{
                background:
                  'linear-gradient(135deg, rgba(139, 124, 246, 0.94) 0%, rgba(108, 152, 245, 0.94) 55%, rgba(224, 132, 198, 0.92) 100%)',
                boxShadow:
                  '0 6px 20px rgba(139, 124, 246, 0.34), inset 0 1px 2px rgba(255, 255, 255, 0.55)',
              }}
              className="min-h-[42px] shrink-0 cursor-pointer rounded-full border border-white/70 px-4 py-2 text-xs font-medium whitespace-nowrap text-white transition-all duration-200 hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:px-5"
            >
              {!hasName
                ? 'Enter Name First'
                : isSubmitting
                ? 'Releasing...'
                : 'Release Bubble'}
            </button>
          </div>
        </form>

        {displayError && (
          <p
            role="alert"
            className="mt-2 text-center text-xs font-medium text-rose-600"
          >
            {displayError}
          </p>
        )}
      </div>
    </div>
  );
}
