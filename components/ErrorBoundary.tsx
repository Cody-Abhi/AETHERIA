'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { firebaseConfig } from '@/lib/firebase';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isQuotaError: boolean;
  isFreeReadQuotaError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isQuotaError: false,
      isFreeReadQuotaError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let message = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(message) as { error?: string };
      if (parsed && typeof parsed.error === 'string') {
        message = parsed.error;
      }
    } catch {
      // Raw non-JSON error message
    }

    const isQuotaError = message.includes('Quota exceeded.');
    const isFreeReadQuotaError = message.includes(
      "Quota exceeded for quota metric 'Free daily read units per project (free tier database)'"
    );

    return {
      hasError: true,
      errorMessage: message,
      isQuotaError,
      isFreeReadQuotaError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AETHERIA ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

      return (
        <div
          role="alert"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#D9E4FF] via-[#EBDDFB] to-[#FCE6DF] p-4"
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-white/90 bg-white/75 p-7 text-center shadow-xl backdrop-blur-2xl"
          >
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-slate-900">
              AETHERIA
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {this.state.isQuotaError
                ? 'Daily Firestore usage quota has been reached. Quota resets tomorrow.'
                : 'Unable to connect cleanly with the thought stream right now.'}
            </p>
            {this.state.isFreeReadQuotaError && (
              <p className="mt-2 text-xs text-slate-600">
                <a
                  href={upgradeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-violet-700 underline hover:text-violet-900"
                >
                  Open Firebase database usage details
                </a>
              </p>
            )}
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600 break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full border border-white bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-2 text-xs font-medium text-white shadow-md transition hover:brightness-105 active:scale-95"
            >
              Reload Aetheria
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
