'use client';

import { CloudRain, Feather, Sparkles, Sun, Wind } from 'lucide-react';
import type { EmotionType } from '@/lib/aetheria';

interface EmotionIconProps {
  emotion: EmotionType;
  className?: string;
}

export function EmotionIcon({ emotion, className = 'w-4 h-4' }: EmotionIconProps) {
  switch (emotion) {
    case 'Calm':
      return <Wind className={className} aria-hidden="true" />;
    case 'Joy':
      return <Sun className={className} aria-hidden="true" />;
    case 'Peace':
      return <Feather className={className} aria-hidden="true" />;
    case 'Melancholy':
      return <CloudRain className={className} aria-hidden="true" />;
    case 'Hope':
      return <Sparkles className={className} aria-hidden="true" />;
  }
}
