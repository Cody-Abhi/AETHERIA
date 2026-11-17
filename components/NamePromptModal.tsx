'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  deriveAuthorHandle,
  validateNameInput,
} from '@/lib/aetheria';

interface NamePromptModalProps {
  isOpen: boolean;
  initialName?: string | null;
  onClose: () => void;
  onSaveName: (name: string) => void;
}

export function NamePromptModal({
  isOpen,
  initialName,
  onClose,
  onSaveName,
}: NamePromptModalProps) {
  const [nameValue, setNameValue] = useState(initialName ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNameValue(initialName ?? '');
      setErrorMessage(null);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [initialName, isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const derivedHandle = deriveAuthorHandle(nameValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateNameInput(nameValue);
    if (!result.valid) {
      setErrorMessage(result.error ?? 'Please enter a valid name.');
      return;
    }
    setErrorMessage(null);
    onSaveName(result.trimmed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          background: 'rgba(235, 240, 252, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        className="fixed inset-0 transition-opacity animate-in fade-in duration-300"
      />

      {/* Frosted Dialog Box */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow:
            '0 24px 60px rgba(120, 130, 190, 0.22), inset 0 2px 6px rgba(255, 255, 255, 0.9)',
        }}
        className="relative z-10 w-full max-w-[420px] rounded-[32px] p-6 sm:p-8 transition-all animate-in zoom-in-95 duration-250"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.85)',
          }}
          className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/60 text-slate-400 backdrop-blur-md transition-all hover:bg-white hover:text-slate-700 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(167, 139, 250, 0.35), rgba(244, 114, 182, 0.25), rgba(96, 165, 250, 0.35))',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 24px rgba(167, 139, 250, 0.25)',
            }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          >
            <Sparkles className="h-7 w-7 text-violet-600" />
          </div>

          <h2
            id="name-modal-title"
            className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-slate-800"
          >
            Welcome to Aetheria
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600/90 leading-relaxed">
            Enter your name or nickname to start releasing your floating thoughts to the world.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="user-name-input"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Your Name or Handle
            </label>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
              }}
              className="flex items-center rounded-2xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-violet-400"
            >
              <span className="mr-1 text-sm font-semibold text-violet-500 select-none">@</span>
              <input
                id="user-name-input"
                ref={inputRef}
                type="text"
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                maxLength={24}
                placeholder="e.g. Luna, River, or Sky"
                autoComplete="nickname"
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 tabular-nums">
                {nameValue.trim().length}/24
              </span>
            </div>

            {/* Live handle preview */}
            <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-slate-500">
              <span>Your thoughts will float as:</span>
              <span className="font-semibold text-violet-600">
                {derivedHandle}
              </span>
            </div>

            {errorMessage && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-500">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={!nameValue.trim()}
              style={{
                background:
                  'linear-gradient(135deg, rgba(139, 124, 246, 0.95) 0%, rgba(108, 152, 245, 0.95) 55%, rgba(224, 132, 198, 0.92) 100%)',
                boxShadow:
                  '0 8px 24px rgba(139, 124, 246, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
              className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-white/70 px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Enter Sanctuary & Share
            </button>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-center text-xs text-slate-500 hover:text-slate-800 transition-colors py-1"
            >
              Browse Anonymously for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

