export type EmotionType = 'Calm' | 'Joy' | 'Peace' | 'Melancholy' | 'Hope';

export interface EmotionMeta {
  id: EmotionType;
  label: string;
  colorHex: string;
  rimGlow: string;
  outerHalo: string;
  iridescentArc: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const EMOTION_LIST: EmotionType[] = ['Calm', 'Joy', 'Peace', 'Melancholy', 'Hope'];

export const EMOTION_CONFIG: Record<EmotionType, EmotionMeta> = {
  Calm: {
    id: 'Calm',
    label: 'Calm',
    colorHex: '#A78BFA',
    rimGlow: 'rgba(167, 139, 250, 0.58)',
    outerHalo: 'rgba(167, 139, 250, 0.55)',
    iridescentArc: 'linear-gradient(135deg, rgba(167, 139, 250, 0.35), rgba(217, 243, 248, 0.25), rgba(255, 255, 255, 0.1))',
    badgeBg: 'bg-violet-50/85',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200/80',
    dotColor: '#A78BFA',
  },
  Joy: {
    id: 'Joy',
    label: 'Joy',
    colorHex: '#FBBF24',
    rimGlow: 'rgba(251, 191, 36, 0.55)',
    outerHalo: 'rgba(251, 191, 36, 0.55)',
    iridescentArc: 'linear-gradient(135deg, rgba(251, 191, 36, 0.34), rgba(253, 230, 223, 0.3), rgba(255, 255, 255, 0.1))',
    badgeBg: 'bg-amber-50/85',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    dotColor: '#FBBF24',
  },
  Peace: {
    id: 'Peace',
    label: 'Peace',
    colorHex: '#34D399',
    rimGlow: 'rgba(52, 211, 153, 0.52)',
    outerHalo: 'rgba(52, 211, 153, 0.55)',
    iridescentArc: 'linear-gradient(135deg, rgba(52, 211, 153, 0.32), rgba(217, 243, 248, 0.28), rgba(255, 255, 255, 0.1))',
    badgeBg: 'bg-emerald-50/85',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200/80',
    dotColor: '#34D399',
  },
  Melancholy: {
    id: 'Melancholy',
    label: 'Melancholy',
    colorHex: '#60A5FA',
    rimGlow: 'rgba(96, 165, 250, 0.56)',
    outerHalo: 'rgba(96, 165, 250, 0.55)',
    iridescentArc: 'linear-gradient(135deg, rgba(96, 165, 250, 0.34), rgba(230, 221, 251, 0.28), rgba(255, 255, 255, 0.1))',
    badgeBg: 'bg-sky-50/85',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    dotColor: '#60A5FA',
  },
  Hope: {
    id: 'Hope',
    label: 'Hope',
    colorHex: '#F472B6',
    rimGlow: 'rgba(244, 114, 182, 0.55)',
    outerHalo: 'rgba(244, 114, 182, 0.55)',
    iridescentArc: 'linear-gradient(135deg, rgba(244, 114, 182, 0.34), rgba(253, 230, 223, 0.3), rgba(255, 255, 255, 0.1))',
    badgeBg: 'bg-pink-50/85',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-200/80',
    dotColor: '#F472B6',
  },
};

export interface ThoughtBubbleData {
  id: string;
  uid?: string;
  username: string;
  emotion: EmotionType;
  message: string;
  timestamp: string;
  dateKey?: string;
  warmthCount: number;
  warmthSent?: boolean;
  isUserCreated?: boolean;
  isFallback?: boolean;
  size: number; // diameter in px
}

export interface BubblePhysicsState {
  id: string;
  x: number; // center x in px
  y: number; // center y in px
  baseX: number;
  vx: number;
  vy: number;
  radius: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayPhase: number;
  driftSpeed: number;
  age: number;
}

export interface BurstDroplet {
  id: string;
  dx: number;
  dy: number;
  size: number;
  delayMs: number;
  color: string;
}

export interface DailyQuotaRecord {
  count: number;
  date: string;
}

export const DAILY_THOUGHT_LIMIT = 5;
export const MAX_THOUGHT_LENGTH = 140;
export const MAX_AUTHOR_HANDLE_LENGTH = 32;
export const MAX_UID_LENGTH = 128;
export const STREAM_LIMIT = 25;
export const AUTHOR_HANDLE_PATTERN = /^@[a-z0-9_]+$/;
export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const QUOTA_STORAGE_KEY = 'aetheria_daily_quota_v1';
export const USER_THOUGHTS_STORAGE_KEY = 'aetheria_user_thoughts_v1';
export const NAME_STORAGE_KEY = 'aetheria_user_name_v1';
export const CLIENT_UID_STORAGE_KEY = 'aetheria_client_uid_v1';

export const SEED_THOUGHTS: ThoughtBubbleData[] = [
  {
    id: 'seed-lyra-1',
    username: 'lyra',
    emotion: 'Calm',
    message: 'Listening to distant rain tap against the windowpane while the tea still steams.',
    timestamp: '08:14 AM',
    warmthCount: 12,
    isFallback: true,
    size: 118,
  },
  {
    id: 'seed-max-1',
    username: 'max',
    emotion: 'Joy',
    message: 'A stranger smiled back on the morning train and somehow the whole street felt lighter.',
    timestamp: '09:02 AM',
    warmthCount: 19,
    isFallback: true,
    size: 124,
  },
  {
    id: 'seed-elara-1',
    username: 'elara',
    emotion: 'Peace',
    message: 'Unclenched my shoulders for the first time all week and remembered to breathe slowly.',
    timestamp: '09:37 AM',
    warmthCount: 15,
    isFallback: true,
    size: 114,
  },
  {
    id: 'seed-sora-1',
    username: 'sora',
    emotion: 'Hope',
    message: 'Grateful for the sudden sunlight after days of rain. It feels like hope.',
    timestamp: '10:48 AM',
    warmthCount: 27,
    isFallback: true,
    size: 128,
  },
  {
    id: 'seed-kai-1',
    username: 'kai',
    emotion: 'Melancholy',
    message: 'Missing the sound of old summer evenings when nobody checked the clock.',
    timestamp: '11:15 AM',
    warmthCount: 9,
    isFallback: true,
    size: 116,
  },
  {
    id: 'seed-kai-2',
    username: 'kai',
    emotion: 'Hope',
    message: 'Small beginnings still count, even when nobody else sees the roots growing.',
    timestamp: '01:22 PM',
    warmthCount: 21,
    isFallback: true,
    size: 120,
  },
];

export function getTodayDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUtcDateKey(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function deriveAuthorHandle(
  displayName: string | null | undefined,
  email?: string | null
): string {
  const rawName = (displayName ?? '').trim().replace(/^@+/, '');
  const firstToken = rawName ? rawName.split(/\s+/)[0] : '';
  const emailPrefix = !firstToken && email ? email.split('@')[0] : '';
  const candidate = (firstToken || emailPrefix)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, MAX_AUTHOR_HANDLE_LENGTH - 1);

  const safeBody = candidate.length >= 1 ? candidate : 'dreamer';
  const handle = `@${safeBody}`;
  return AUTHOR_HANDLE_PATTERN.test(handle) ? handle : '@dreamer';
}

export function getOrCreateClientUid(): string {
  if (typeof window === 'undefined') {
    return 'anon_guest_seed';
  }
  try {
    const existing = window.localStorage.getItem(CLIENT_UID_STORAGE_KEY);
    if (existing && existing.length > 0) {
      return existing;
    }
    const newUid = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(CLIENT_UID_STORAGE_KEY, newUid);
    return newUid;
  } catch {
    return `anon_${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function getLocalUserName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(NAME_STORAGE_KEY);
    return stored ? stored.trim() : null;
  } catch {
    return null;
  }
}

export function setLocalUserName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name.trim());
  } catch {
    // ignore
  }
}

export function validateNameInput(name: string): {
  valid: boolean;
  trimmed: string;
  handle: string;
  error?: string;
} {
  const trimmed = name.trim().replace(/^@+/, '');
  if (!trimmed) {
    return { valid: false, trimmed: '', handle: '@dreamer', error: 'Please enter your name or handle.' };
  }
  if (trimmed.length > 24) {
    return {
      valid: false,
      trimmed: trimmed.slice(0, 24),
      handle: deriveAuthorHandle(trimmed),
      error: 'Name must be 24 characters or less.',
    };
  }
  return {
    valid: true,
    trimmed,
    handle: deriveAuthorHandle(trimmed),
  };
}

export function stripLeadingAt(handle: string): string {
  const cleaned = handle.trim().replace(/^@+/, '');
  return cleaned || 'dreamer';
}

export function computeBubbleDiameter(id: string, textLength: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  const lengthBoost = Math.min(10, Math.floor(textLength / 16));
  return 110 + (hash % 9) + lengthBoost;
}

export function formatCurrentTimestamp(now: Date = new Date()): string {
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function parseDailyQuota(raw: string | null, todayKey: string): DailyQuotaRecord {
  if (!raw) {
    return { count: 0, date: todayKey };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DailyQuotaRecord>;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      parsed.date === todayKey &&
      typeof parsed.count === 'number' &&
      Number.isFinite(parsed.count)
    ) {
      const clamped = Math.max(0, Math.min(DAILY_THOUGHT_LIMIT, Math.floor(parsed.count)));
      return { count: clamped, date: todayKey };
    }
  } catch {
    // Ignore malformed storage and reset cleanly
  }
  return { count: 0, date: todayKey };
}

export function canReleaseThought(quota: DailyQuotaRecord, todayKey: string): boolean {
  if (quota.date !== todayKey) {
    return true;
  }
  return quota.count < DAILY_THOUGHT_LIMIT;
}

export function getRemainingThoughts(quota: DailyQuotaRecord, todayKey: string): number {
  if (quota.date !== todayKey) {
    return DAILY_THOUGHT_LIMIT;
  }
  return Math.max(0, DAILY_THOUGHT_LIMIT - quota.count);
}

export function consumeDailyQuota(
  quota: DailyQuotaRecord,
  todayKey: string
): { nextQuota: DailyQuotaRecord; allowed: boolean } {
  const active = quota.date === todayKey ? quota : { count: 0, date: todayKey };
  if (active.count >= DAILY_THOUGHT_LIMIT) {
    return { nextQuota: active, allowed: false };
  }
  return {
    nextQuota: { count: active.count + 1, date: todayKey },
    allowed: true,
  };
}

export interface ValidationResult {
  valid: boolean;
  trimmed: string;
  error?: string;
}

export function validateThoughtInput(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, trimmed: '', error: 'Write a quiet thought before releasing a bubble.' };
  }
  if (trimmed.length > MAX_THOUGHT_LENGTH) {
    return {
      valid: false,
      trimmed,
      error: `Thoughts can be up to ${MAX_THOUGHT_LENGTH} characters.`,
    };
  }
  return { valid: true, trimmed };
}

export function createBurstDroplets(
  emotion: EmotionType,
  count: number = 12,
  seedOffset: number = 0
): BurstDroplet[] {
  const clampedCount = Math.max(10, Math.min(14, count));
  const color = EMOTION_CONFIG[emotion].colorHex;
  const droplets: BurstDroplet[] = [];

  for (let i = 0; i < clampedCount; i++) {
    const baseAngle = (i / clampedCount) * Math.PI * 2;
    const jitter = Math.sin(seedOffset * 7.3 + i * 2.1) * 0.28;
    const angle = baseAngle + jitter;
    const distance = 58 + ((i * 19 + seedOffset * 11) % 44);
    const size = 6 + ((i * 5 + seedOffset) % 8);
    droplets.push({
      id: `droplet-${i}-${seedOffset}`,
      dx: Math.round(Math.cos(angle) * distance * 10) / 10,
      dy: Math.round(Math.sin(angle) * distance * 10) / 10,
      size,
      delayMs: (i % 3) * 18,
      color: i % 3 === 0 ? '#FFFFFF' : color,
    });
  }

  return droplets;
}

export interface CanvasBounds {
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
  sideInset: number;
}

export function getEffectiveBubbleDiameter(baseSize: number, viewportWidth: number): number {
  if (viewportWidth < 640) {
    return Math.round(baseSize * 0.72);
  }
  if (viewportWidth < 1024) {
    return Math.round(baseSize * 0.88);
  }
  return baseSize;
}

export function getSafeCanvasBounds(viewportWidth: number, viewportHeight: number): CanvasBounds {
  const isCompact = viewportWidth < 640;
  return {
    width: Math.max(320, viewportWidth),
    height: Math.max(480, viewportHeight),
    topInset: isCompact ? 104 : 122,
    bottomInset: isCompact ? 196 : 184,
    sideInset: isCompact ? 56 : 104,
  };
}

export function createInitialBubbleStates(
  bubbles: ThoughtBubbleData[],
  bounds: CanvasBounds
): BubblePhysicsState[] {
  const usableWidth = Math.max(120, bounds.width - bounds.sideInset * 2);
  const usableHeight = Math.max(180, bounds.height - bounds.topInset - bounds.bottomInset);
  const cols = bounds.width < 640 ? 2 : bounds.width < 1024 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(bubbles.length / cols));

  return bubbles.map((bubble, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellW = usableWidth / cols;
    const cellH = usableHeight / rows;

    // Stagger odd rows slightly so vertically stacked bubbles & labels never align directly
    const rowStagger = (row % 2 === 1 ? 1 : -1) * Math.min(18, cellW * 0.1);
    const jitterX = Math.sin(idx * 2.7 + 0.5) * Math.min(20, cellW * 0.12) + rowStagger;
    const jitterY = Math.cos(idx * 1.9 + 0.8) * Math.min(14, cellH * 0.1);

    const minX = bounds.sideInset;
    const maxX = Math.max(minX + 10, bounds.width - bounds.sideInset);
    const minY = bounds.topInset;
    const maxY = Math.max(minY + 20, bounds.height - bounds.bottomInset);

    const x = Math.max(minX, Math.min(maxX, bounds.sideInset + cellW * (col + 0.5) + jitterX));
    const y = Math.max(minY, Math.min(maxY, bounds.topInset + cellH * (row + 0.5) + jitterY));
    const diameter = getEffectiveBubbleDiameter(bubble.size, bounds.width);
    const radius = diameter / 2;

    return {
      id: bubble.id,
      x,
      y,
      baseX: x,
      vx: 0,
      vy: 0,
      radius,
      swayAmplitude: bounds.width < 640 ? 8 + (idx % 3) * 3 : 14 + (idx % 4) * 4,
      swaySpeed: 0.45 + (idx % 5) * 0.08,
      swayPhase: idx * 1.15,
      driftSpeed: bounds.width < 640 ? 7 + (idx % 3) * 2.5 : 10 + (idx % 4) * 3,
      age: idx * 1.7,
    };
  });
}

export function spawnBubbleFromBottom(
  bubble: ThoughtBubbleData,
  bounds: CanvasBounds,
  existingStates: BubblePhysicsState[]
): BubblePhysicsState {
  const minX = bounds.sideInset;
  const maxX = Math.max(minX + 10, bounds.width - bounds.sideInset);
  const span = maxX - minX;

  // Pick the least-crowded horizontal lane across the canvas so multiple releases spread out
  const laneCount = bounds.width < 640 ? 3 : 5;
  let bestX = bounds.width / 2;
  let bestMinDist = -1;

  for (let i = 0; i < laneCount; i++) {
    const candidateX = minX + (span * (i + 0.5)) / laneCount;
    let nearest = Infinity;
    for (const st of existingStates) {
      const dist = Math.hypot(st.x - candidateX, st.y - (bounds.height - bounds.bottomInset));
      if (dist < nearest) nearest = dist;
    }
    if (nearest > bestMinDist) {
      bestMinDist = nearest;
      bestX = candidateX;
    }
  }

  const spawnX = Math.max(minX, Math.min(maxX, bestX));
  const spawnY = Math.max(bounds.topInset + 20, bounds.height - bounds.bottomInset + 16);
  const diameter = getEffectiveBubbleDiameter(bubble.size, bounds.width);

  return {
    id: bubble.id,
    x: spawnX,
    y: spawnY,
    baseX: spawnX,
    vx: 0,
    vy: -95, // smooth initial upward rise from composer dock
    radius: diameter / 2,
    swayAmplitude: bounds.width < 640 ? 10 : 15,
    swaySpeed: 0.52 + (existingStates.length % 4) * 0.08,
    swayPhase: existingStates.length * 0.9,
    driftSpeed: bounds.width < 640 ? 8 : 12,
    age: 0,
  };
}

export function stepBubblePhysics(
  states: BubblePhysicsState[],
  bounds: CanvasBounds,
  dtSeconds: number,
  pausedId: string | null = null
): BubblePhysicsState[] {
  const dt = Math.min(0.05, Math.max(0.001, dtSeconds));
  const isCompact = bounds.width < 640;
  const minX = bounds.sideInset;
  const maxX = Math.max(minX + 20, bounds.width - bounds.sideInset);
  const minY = bounds.topInset;
  const maxY = Math.max(minY + 40, bounds.height - bounds.bottomInset);

  const next = states.map((b) => {
    if (pausedId && b.id === pausedId) {
      return b;
    }

    const age = b.age + dt;
    // Gentle upward drift + decaying initial rise velocity
    const vy = b.vy * Math.pow(0.28, dt);
    let y = b.y - b.driftSpeed * dt + vy * dt;

    // Wrap smoothly from top safe zone back to bottom safe zone
    if (y < minY) {
      y = maxY;
    } else if (y > maxY + 24) {
      y = maxY + 24;
    }

    // Sinusoidal horizontal sway around baseX
    const targetSwayX = b.baseX + Math.sin(age * b.swaySpeed + b.swayPhase) * b.swayAmplitude;
    const xDiff = targetSwayX - b.x;
    const x = Math.max(minX, Math.min(maxX, b.x + xDiff * Math.min(1, dt * 3.5) + b.vx * dt));
    const vx = b.vx * Math.pow(0.15, dt);

    return {
      ...b,
      x,
      y,
      vx,
      vy,
      age,
    };
  });

  // Elliptical repulsion accounting for the frosted pill badge hanging ~40px below each bubble
  const extraX = isCompact ? 26 : 42;
  const extraY = isCompact ? 48 : 60;

  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i];
      const b = next[j];

      const minDx = a.radius + b.radius + extraX;
      const minDy = a.radius + b.radius + extraY;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const normX = dx / minDx;
      const normY = dy / minDy;
      const ellipDistSq = normX * normX + normY * normY;

      if (ellipDistSq < 1) {
        const ellipDist = Math.sqrt(ellipDistSq) || 0.001;
        const overlap = 1 - ellipDist;
        const nx = normX / ellipDist;
        const ny = normY / ellipDist;
        const pushX = nx * overlap * (isCompact ? 110 : 165) * dt;
        const pushY = ny * overlap * (isCompact ? 130 : 185) * dt;

        if (a.id !== pausedId) {
          a.x = Math.max(minX, Math.min(maxX, a.x - pushX));
          a.y = Math.max(minY, Math.min(maxY, a.y - pushY));
          a.baseX = Math.max(minX, Math.min(maxX, a.baseX - pushX * 0.55));
        }

        if (b.id !== pausedId) {
          b.x = Math.max(minX, Math.min(maxX, b.x + pushX));
          b.y = Math.max(minY, Math.min(maxY, b.y + pushY));
          b.baseX = Math.max(minX, Math.min(maxX, b.baseX + pushX * 0.55));
        }
      }
    }
  }

  return next;
}

export function reconcileBubblePhysics(
  existingStates: BubblePhysicsState[],
  nextBubbles: ThoughtBubbleData[],
  bounds: CanvasBounds
): BubblePhysicsState[] {
  if (nextBubbles.length === 0) {
    return [];
  }

  if (existingStates.length === 0) {
    let initial = createInitialBubbleStates(nextBubbles, bounds);
    for (let i = 0; i < 24; i++) {
      initial = stepBubblePhysics(initial, bounds, 0.03);
    }
    return initial;
  }

  const byId = new Map(existingStates.map((st) => [st.id, st]));
  const result: BubblePhysicsState[] = [];

  for (const bubble of nextBubbles) {
    const existing = byId.get(bubble.id);
    if (existing) {
      const nextRadius = getEffectiveBubbleDiameter(bubble.size, bounds.width) / 2;
      result.push(
        existing.radius === nextRadius ? existing : { ...existing, radius: nextRadius }
      );
    } else {
      const spawned = spawnBubbleFromBottom(bubble, bounds, result);
      result.push(spawned);
    }
  }

  return result;
}
