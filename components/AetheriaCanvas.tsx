'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { AmbientBackground } from '@/components/AmbientBackground';
import { ComposerDock } from '@/components/ComposerDock';
import { FloatingBubble } from '@/components/FloatingBubble';
import { MessageRevealCard } from '@/components/MessageRevealCard';
import { TopHeader } from '@/components/TopHeader';
import {
  AUTHOR_HANDLE_PATTERN,
  DAILY_THOUGHT_LIMIT,
  DATE_KEY_PATTERN,
  EMOTION_LIST,
  MAX_THOUGHT_LENGTH,
  MAX_UID_LENGTH,
  SEED_THOUGHTS,
  STREAM_LIMIT,
  computeBubbleDiameter,
  createBurstDroplets,
  deriveAuthorHandle,
  formatCurrentTimestamp,
  getEffectiveBubbleDiameter,
  getSafeCanvasBounds,
  getUtcDateKey,
  reconcileBubblePhysics,
  stepBubblePhysics,
  stripLeadingAt,
  validateThoughtInput,
  type BubblePhysicsState,
  type BurstDroplet,
  type EmotionType,
  type ThoughtBubbleData,
} from '@/lib/aetheria';
import {
  OperationType,
  auth,
  db,
  handleFirestoreError,
  signInWithGoogle,
  signOutUser,
  testConnection,
} from '@/lib/firebase';
import {
  getSoundPreferenceServerSnapshot,
  getSoundPreferenceSnapshot,
  playBubbleHover,
  playBubblePop,
  playEmotionTap,
  playReleaseBubble,
  playSendWarmth,
  setSoundPreference,
  subscribeSoundPreference,
  unlockSoundEngine,
} from '@/lib/soundEngine';

interface FirestoreBubbleDoc {
  uid?: unknown;
  authorHandle?: unknown;
  text?: unknown;
  emotion?: unknown;
  createdAt?: Timestamp | null;
  dateKey?: unknown;
  warmthCount?: unknown;
}

function isEmotionType(value: unknown): value is EmotionType {
  return typeof value === 'string' && EMOTION_LIST.includes(value as EmotionType);
}

export function AetheriaCanvas() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [streamBubbles, setStreamBubbles] = useState<ThoughtBubbleData[]>(SEED_THOUGHTS);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [warmthSentIds, setWarmthSentIds] = useState<Record<string, boolean>>({});
  const [fallbackWarmthBonus, setFallbackWarmthBonus] = useState<Record<string, number>>({});

  const soundEnabled = useSyncExternalStore(
    subscribeSoundPreference,
    getSoundPreferenceSnapshot,
    getSoundPreferenceServerSnapshot
  );
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [droplets, setDroplets] = useState<BurstDroplet[]>([]);
  const [viewportWidth, setViewportWidth] = useState<number>(1440);
  const [isReady, setIsReady] = useState<boolean>(false);

  const physicsRef = useRef<BubblePhysicsState[]>([]);
  const bubbleNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hoveredBubbleIdRef = useRef<string | null>(null);
  const popTimerRef = useRef<number | null>(null);
  const popSeedRef = useRef<number>(1);
  const bubblesRef = useRef<ThoughtBubbleData[]>(SEED_THOUGHTS);

  // Surface asynchronous Firestore listener/mutation errors cleanly to ErrorBoundary
  if (fatalError) {
    throw fatalError;
  }

  const bubbles = useMemo(() => {
    return streamBubbles.map((item) => {
      const sent = Boolean(warmthSentIds[item.id]);
      const bonus = item.isFallback ? fallbackWarmthBonus[item.id] ?? 0 : 0;
      return {
        ...item,
        warmthSent: sent,
        warmthCount: item.warmthCount + bonus,
      };
    });
  }, [fallbackWarmthBonus, streamBubbles, warmthSentIds]);

  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  const syncDomTransforms = useCallback(() => {
    for (const state of physicsRef.current) {
      const node = bubbleNodeRefs.current[state.id];
      if (node) {
        node.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`;
      }
    }
  }, []);

  // Validate Firestore connectivity on boot and subscribe to Google Auth state
  useEffect(() => {
    void testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setTodayCount(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Initialize viewport & initial physics state cleanly on mount
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewportWidth(w);
      const bounds = getSafeCanvasBounds(w, h);
      physicsRef.current = reconcileBubblePhysics(physicsRef.current, bubblesRef.current, bounds);
      setIsReady(true);
      syncDomTransforms();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [syncDomTransforms]);

  // Public real-time stream of the 25 most recent bubbles (available to all visitors without login)
  useEffect(() => {
    if (!authReady) return;

    const bubblesQuery = query(
      collection(db, 'bubbles'),
      orderBy('createdAt', 'desc'),
      limit(STREAM_LIMIT)
    );

    const unsubscribeStream = onSnapshot(
      bubblesQuery,
      (snapshot) => {
        const nextList: ThoughtBubbleData[] = snapshot.empty
          ? SEED_THOUGHTS
          : snapshot.docs.map((docSnap) => {
              const data = docSnap.data() as FirestoreBubbleDoc;
              const rawText = typeof data.text === 'string' ? data.text : '';
              const rawHandle = typeof data.authorHandle === 'string' ? data.authorHandle : '@dreamer';
              const createdDate =
                data.createdAt && typeof data.createdAt.toDate === 'function'
                  ? data.createdAt.toDate()
                  : new Date();

              return {
                id: docSnap.id,
                uid: typeof data.uid === 'string' ? data.uid : undefined,
                username: stripLeadingAt(rawHandle),
                emotion: isEmotionType(data.emotion) ? data.emotion : 'Calm',
                message: rawText,
                timestamp: formatCurrentTimestamp(createdDate),
                dateKey: typeof data.dateKey === 'string' ? data.dateKey : undefined,
                warmthCount:
                  typeof data.warmthCount === 'number' && Number.isFinite(data.warmthCount)
                    ? data.warmthCount
                    : 0,
                isFallback: false,
                size: computeBubbleDiameter(docSnap.id, rawText.length),
              };
            });

        const bounds = getSafeCanvasBounds(window.innerWidth, window.innerHeight);
        physicsRef.current = reconcileBubblePhysics(physicsRef.current, nextList, bounds);
        setStreamBubbles(nextList);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'bubbles');
        } catch (wrappedError) {
          setFatalError(
            wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError))
          );
        }
      }
    );

    return () => unsubscribeStream();
  }, [authReady]);

  // Real-time 5-thoughts-a-day quota query for the currently signed-in user (UTC dateKey)
  useEffect(() => {
    if (!authReady || !user) return;

    const utcDateKey = getUtcDateKey();
    const quotaQuery = query(
      collection(db, 'bubbles'),
      where('uid', '==', user.uid),
      where('dateKey', '==', utcDateKey)
    );

    const unsubscribeQuota = onSnapshot(
      quotaQuery,
      (snapshot) => {
        setTodayCount(snapshot.size);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'bubbles');
        } catch (wrappedError) {
          setFatalError(
            wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError))
          );
        }
      }
    );

    return () => unsubscribeQuota();
  }, [authReady, user]);

  // Keep DOM transforms synced whenever bubble list updates
  useEffect(() => {
    if (!isReady) return;
    const frameId = window.requestAnimationFrame(syncDomTransforms);
    return () => window.cancelAnimationFrame(frameId);
  }, [bubbles, isReady, syncDomTransforms]);

  // 60fps requestAnimationFrame physics loop
  useEffect(() => {
    if (!isReady) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      if (!prefersReducedMotion && physicsRef.current.length > 0) {
        const bounds = getSafeCanvasBounds(window.innerWidth, window.innerHeight);
        physicsRef.current = stepBubblePhysics(
          physicsRef.current,
          bounds,
          rawDt,
          hoveredBubbleIdRef.current
        );
        syncDomTransforms();
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    let prevW = window.innerWidth;
    let prevH = window.innerHeight;
    const getCols = (width: number) => (width < 640 ? 2 : width < 1024 ? 3 : 4);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const crossedBreakpoint = getCols(prevW) !== getCols(w);
      const scaleX = prevW > 0 ? w / prevW : 1;
      const scaleY = prevH > 0 ? h / prevH : 1;
      prevW = w;
      prevH = h;

      setViewportWidth(w);
      const bounds = getSafeCanvasBounds(w, h);

      if (crossedBreakpoint) {
        physicsRef.current = reconcileBubblePhysics([], bubblesRef.current, bounds);
      } else {
        const minX = bounds.sideInset;
        const maxX = Math.max(minX + 10, bounds.width - bounds.sideInset);
        const minY = bounds.topInset;
        const maxY = Math.max(minY + 20, bounds.height - bounds.bottomInset);

        physicsRef.current = physicsRef.current.map((st) => {
          const matched = bubblesRef.current.find((b) => b.id === st.id);
          const radius = matched ? getEffectiveBubbleDiameter(matched.size, w) / 2 : st.radius;
          const scaledX = Math.max(minX, Math.min(maxX, st.x * scaleX));
          const scaledBaseX = Math.max(minX, Math.min(maxX, st.baseX * scaleX));
          const scaledY = Math.max(minY, Math.min(maxY, st.y * scaleY));
          return { ...st, x: scaledX, baseX: scaledBaseX, y: scaledY, radius };
        });
        for (let i = 0; i < 16; i++) {
          physicsRef.current = stepBubblePhysics(physicsRef.current, bounds, 0.03);
        }
      }
      syncDomTransforms();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReady, syncDomTransforms]);

  // Unlock AudioContext cleanly on the user's first pointer or keyboard gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      unlockSoundEngine();
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Cleanup pending pop timers on unmount
  useEffect(() => {
    return () => {
      if (popTimerRef.current !== null) {
        window.clearTimeout(popTimerRef.current);
      }
    };
  }, []);

  const userHandle = useMemo(() => {
    if (!user) return null;
    return deriveAuthorHandle(user.displayName, user.email);
  }, [user]);

  const remainingThoughts = useMemo(() => {
    if (!user) return DAILY_THOUGHT_LIMIT;
    return Math.max(0, DAILY_THOUGHT_LIMIT - todayCount);
  }, [todayCount, user]);

  const activeBubble = useMemo(() => {
    if (!activeBubbleId) return null;
    return bubbles.find((b) => b.id === activeBubbleId) ?? null;
  }, [activeBubbleId, bubbles]);

  const handleSignIn = useCallback(async () => {
    unlockSoundEngine();
    setStatusError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setStatusError('Could not complete Google Sign-In. Please allow popups and try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setStatusError(null);
    try {
      await signOutUser();
    } catch {
      setStatusError('Could not sign out right now.');
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    unlockSoundEngine();
    setSoundPreference(!soundEnabled);
  }, [soundEnabled]);

  const handleHoverChange = useCallback(
    (id: string, hovered: boolean) => {
      if (hovered) {
        if (hoveredBubbleIdRef.current !== id) {
          playBubbleHover(soundEnabled);
        }
        hoveredBubbleIdRef.current = id;
      } else if (hoveredBubbleIdRef.current === id) {
        hoveredBubbleIdRef.current = null;
      }
    },
    [soundEnabled]
  );

  const handlePopBubble = useCallback(
    (bubble: ThoughtBubbleData) => {
      if (poppingId || activeBubbleId) return;

      playBubblePop(soundEnabled);

      popSeedRef.current += 1;
      setPoppingId(bubble.id);
      setDroplets(createBurstDroplets(bubble.emotion, 12, popSeedRef.current));

      if (popTimerRef.current !== null) {
        window.clearTimeout(popTimerRef.current);
      }

      popTimerRef.current = window.setTimeout(() => {
        setPoppingId(null);
        setDroplets([]);
        setActiveBubbleId(bubble.id);
      }, 240);
    },
    [activeBubbleId, poppingId, soundEnabled]
  );

  const handleCloseCard = useCallback(() => {
    hoveredBubbleIdRef.current = null;
    setActiveBubbleId(null);
  }, []);

  const handleSendWarmth = useCallback(
    async (bubbleId: string) => {
      if (warmthSentIds[bubbleId]) return;

      const target = bubblesRef.current.find((b) => b.id === bubbleId);
      if (!target) return;

      setWarmthSentIds((prev) => ({ ...prev, [bubbleId]: true }));
      playSendWarmth(soundEnabled);

      if (target.isFallback) {
        setFallbackWarmthBonus((prev) => ({
          ...prev,
          [bubbleId]: (prev[bubbleId] ?? 0) + 1,
        }));
        return;
      }

      const path = `bubbles/${bubbleId}`;
      try {
        await updateDoc(doc(db, 'bubbles', bubbleId), {
          warmthCount: increment(1),
        });
      } catch (error) {
        setWarmthSentIds((prev) => {
          const next = { ...prev };
          delete next[bubbleId];
          return next;
        });
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [soundEnabled, warmthSentIds]
  );

  const handleSelectEmotion = useCallback(
    (emotion: EmotionType) => {
      playEmotionTap(emotion, soundEnabled);
    },
    [soundEnabled]
  );

  const handleReleaseBubble = useCallback(
    async (message: string, emotion: EmotionType): Promise<boolean> => {
      if (!user) {
        setStatusError('Please sign in with Google to release a bubble.');
        return false;
      }
      if (remainingThoughts <= 0) {
        return false;
      }

      const validation = validateThoughtInput(message);
      if (!validation.valid) {
        setStatusError(validation.error ?? 'Please write a valid thought.');
        return false;
      }

      const safeUid = user.uid.slice(0, MAX_UID_LENGTH);
      const authorHandle = deriveAuthorHandle(user.displayName, user.email);
      const dateKey = getUtcDateKey();
      const safeText = validation.trimmed.slice(0, MAX_THOUGHT_LENGTH);

      if (
        !safeUid ||
        !AUTHOR_HANDLE_PATTERN.test(authorHandle) ||
        !DATE_KEY_PATTERN.test(dateKey) ||
        !EMOTION_LIST.includes(emotion)
      ) {
        setStatusError('Unable to validate thought payload.');
        return false;
      }

      setStatusError(null);
      setIsSubmitting(true);

      try {
        await addDoc(collection(db, 'bubbles'), {
          uid: safeUid,
          authorHandle,
          text: safeText,
          emotion,
          createdAt: serverTimestamp(),
          dateKey,
          warmthCount: 0,
        });
        playReleaseBubble(soundEnabled);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'bubbles');
      } finally {
        setIsSubmitting(false);
      }
    },
    [remainingThoughts, soundEnabled, user]
  );

  return (
    <div className="relative h-dvh w-screen overflow-hidden select-none">
      <AmbientBackground />

      <TopHeader
        remainingThoughts={remainingThoughts}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isAuthReady={authReady}
        userHandle={userHandle}
        isSigningIn={isSigningIn}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Interactive Floating Bubble Canvas */}
      <main
        aria-label="Floating thought bubbles"
        data-testid="bubble-canvas"
        className={`relative z-10 h-full w-full transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {bubbles.map((bubble) => {
          const isPopping = poppingId === bubble.id;
          const isHidden = activeBubbleId === bubble.id;
          const displaySize = getEffectiveBubbleDiameter(bubble.size, viewportWidth);
          return (
            <FloatingBubble
              key={bubble.id}
              ref={(el) => {
                bubbleNodeRefs.current[bubble.id] = el;
              }}
              bubble={bubble}
              displaySize={displaySize}
              isPopping={isPopping}
              isHidden={isHidden}
              droplets={isPopping ? droplets : []}
              onPop={handlePopBubble}
              onHoverChange={handleHoverChange}
            />
          );
        })}
      </main>

      <MessageRevealCard
        bubble={activeBubble}
        onClose={handleCloseCard}
        onSendWarmth={handleSendWarmth}
      />

      <ComposerDock
        isSignedIn={Boolean(user)}
        isAuthReady={authReady}
        isSubmitting={isSubmitting}
        remainingThoughts={remainingThoughts}
        statusError={statusError}
        onSignIn={handleSignIn}
        onRelease={handleReleaseBubble}
        onSelectEmotion={handleSelectEmotion}
      />
    </div>
  );
}
