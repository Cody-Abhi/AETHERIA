import type { EmotionType } from '@/lib/aetheria';

export const SOUND_STORAGE_KEY = 'aetheria_sound_enabled_v1';

export const EMOTION_PENTATONIC_HZ: Record<EmotionType, number> = {
  Calm: 523.25, // C5
  Joy: 587.33, // D5
  Peace: 659.25, // E5
  Melancholy: 783.99, // G5
  Hope: 880.0, // A5
};

export const MAJOR_NINTH_BELL_CHORD_HZ = [
  523.25, // C5
  659.25, // E5
  783.99, // G5
  987.77, // B5
  1174.66, // D6
] as const;

export function parseSoundPreference(raw: string | null): boolean {
  if (raw === 'false' || raw === '0') {
    return false;
  }
  return true;
}

const soundListeners = new Set<() => void>();

export function subscribeSoundPreference(listener: () => void): () => void {
  soundListeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    soundListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

export function getSoundPreferenceSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return parseSoundPreference(window.localStorage.getItem(SOUND_STORAGE_KEY));
  } catch {
    return true;
  }
}

export function getSoundPreferenceServerSnapshot(): boolean {
  return true;
}

export function setSoundPreference(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }
  for (const listener of soundListeners) {
    listener();
  }
}

export function computeRandomizedPopPitch(baseHz: number, randomUnit: number): number {
  const clamped = Math.max(0, Math.min(1, randomUnit));
  const multiplier = 0.92 + clamped * 0.16; // ±8%
  return Math.round(baseHz * multiplier * 100) / 100;
}

let sharedAudioCtx: AudioContext | null = null;
let lastHoverTimeMs = 0;

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  );
}

/**
 * Unlocks/resumes the shared AudioContext safely inside a real user gesture.
 */
export function unlockSoundEngine(): void {
  const AudioCtx = getAudioContextConstructor();
  if (!AudioCtx) return;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return;
    }
  }

  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume().catch(() => {});
  }
}

function getAudioContext(allowCreateFromGesture: boolean): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!sharedAudioCtx) {
    if (!allowCreateFromGesture) {
      return null;
    }
    unlockSoundEngine();
  }

  if (!sharedAudioCtx) {
    return null;
  }

  if (sharedAudioCtx.state === 'suspended') {
    if (!allowCreateFromGesture) {
      return null;
    }
    void sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx.state === 'running' || allowCreateFromGesture ? sharedAudioCtx : null;
}

function createPinkNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < sampleCount; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
    data[i] = Math.max(-1, Math.min(1, pink));
  }

  return buffer;
}

/**
 * 1. Bubble Hover (Subtle Glass Shimmer):
 * Crystalline sine chime (1200Hz to 1600Hz) at 0.03 gain with 60ms fade-out.
 * Never attempts to create/resume AudioContext before a user gesture.
 */
export function playBubbleHover(enabled: boolean): void {
  if (!enabled) return;

  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (nowMs - lastHoverTimeMs < 85) return;

  const ctx = getAudioContext(false);
  if (!ctx || ctx.state !== 'running') return;

  lastHoverTimeMs = nowMs;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.055);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.03, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.068);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.075);
}

/**
 * 2. Bubble Pop (Realistic Water-Droplet Burst):
 * Rapid upward sweep (280Hz -> 880Hz over 75ms) with ±8% pitch randomization,
 * layered with a 30ms bandpass-filtered white noise burst at 2200Hz.
 */
export function playBubblePop(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const pitchRoll = Math.random();
  const startFreq = computeRandomizedPopPitch(280, pitchRoll);
  const endFreq = computeRandomizedPopPitch(880, pitchRoll);

  // Sine core droplet sweep
  const sineOsc = ctx.createOscillator();
  const sineGain = ctx.createGain();
  sineOsc.type = 'sine';
  sineOsc.frequency.setValueAtTime(startFreq, now);
  sineOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.075);

  sineGain.gain.setValueAtTime(0.001, now);
  sineGain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  sineGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.095);

  sineOsc.connect(sineGain);
  sineGain.connect(ctx.destination);
  sineOsc.start(now);
  sineOsc.stop(now + 0.1);

  // Subtle triangle harmonic warmth
  const triOsc = ctx.createOscillator();
  const triGain = ctx.createGain();
  triOsc.type = 'triangle';
  triOsc.frequency.setValueAtTime(startFreq, now);
  triOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.075);

  triGain.gain.setValueAtTime(0.0005, now);
  triGain.gain.linearRampToValueAtTime(0.045, now + 0.008);
  triGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.08);

  triOsc.connect(triGain);
  triGain.connect(ctx.destination);
  triOsc.start(now);
  triOsc.stop(now + 0.085);

  // 30ms white-noise snap filtered around 2200Hz
  const noiseSamples = Math.max(1, Math.floor(ctx.sampleRate * 0.03));
  const noiseBuffer = ctx.createBuffer(1, noiseSamples, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseSamples; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseSamples * 0.32));
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(2200, now);
  bandpass.Q.setValueAtTime(1.6, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.09, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.03);

  noiseSource.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(now);
}

/**
 * 3. Release Bubble (Ethereal Rising Whoosh + Chime):
 * Pink-noise lowpass sweep (200Hz -> 900Hz over 450ms) + major-9th bell chord
 * (C5, E5, G5, B5, D6 staggered by 40ms each) fading smoothly over 1.2s.
 */
export function playReleaseBubble(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;

  // Airy pink-noise whoosh
  const pinkBuffer = createPinkNoiseBuffer(ctx, 0.5);
  const pinkSource = ctx.createBufferSource();
  pinkSource.buffer = pinkBuffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(200, now);
  lowpass.frequency.exponentialRampToValueAtTime(900, now + 0.45);
  lowpass.Q.setValueAtTime(0.9, now);

  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(0.0005, now);
  whooshGain.gain.linearRampToValueAtTime(0.055, now + 0.14);
  whooshGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.48);

  pinkSource.connect(lowpass);
  lowpass.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  pinkSource.start(now);

  // Warm major-9th bell chord staggered by 40ms
  MAJOR_NINTH_BELL_CHORD_HZ.forEach((freq, idx) => {
    const start = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.042, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0002, start + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 1.22);
  });
}

/**
 * 4. Send Warmth Reaction (Soft Heartbeat / Sparkle):
 * Two gentle marimba-like sine pulses (523.25Hz followed 90ms later by 659.25Hz)
 * with a soft 300ms decay.
 */
export function playSendWarmth(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const pulses = [
    { freq: 523.25, delay: 0, peak: 0.1 },
    { freq: 659.25, delay: 0.09, peak: 0.11 },
  ];

  for (const pulse of pulses) {
    const start = now + pulse.delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pulse.freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(pulse.peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0002, start + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.32);
  }
}

/**
 * 5. Emotion Selector Click (Tactile Droplet Tap):
 * Pentatonic note (C5, D5, E5, G5, A5) played as a soft 120ms water drop.
 */
export function playEmotionTap(emotion: EmotionType, enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const targetHz = EMOTION_PENTATONIC_HZ[emotion];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(targetHz * 0.9, now);
  osc.frequency.exponentialRampToValueAtTime(targetHz, now + 0.018);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.085, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0002, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}
