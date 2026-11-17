import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHOR_HANDLE_PATTERN,
  DAILY_THOUGHT_LIMIT,
  DATE_KEY_PATTERN,
  MAX_THOUGHT_LENGTH,
  SEED_THOUGHTS,
  canReleaseThought,
  computeBubbleDiameter,
  consumeDailyQuota,
  createBurstDroplets,
  createInitialBubbleStates,
  deriveAuthorHandle,
  getEffectiveBubbleDiameter,
  getRemainingThoughts,
  getSafeCanvasBounds,
  getTodayDateKey,
  getUtcDateKey,
  parseDailyQuota,
  reconcileBubblePhysics,
  spawnBubbleFromBottom,
  stepBubblePhysics,
  stripLeadingAt,
  validateThoughtInput,
} from './aetheria';

test('seed thoughts contain 6 fallback entries from @lyra, @max, @elara, @sora, and @kai including the sunlight quote', () => {
  assert.equal(SEED_THOUGHTS.length, 6);
  const authors = new Set(SEED_THOUGHTS.map((t) => t.username));
  for (const expected of ['lyra', 'max', 'elara', 'sora', 'kai']) {
    assert.ok(authors.has(expected), `Missing seed author @${expected}`);
  }
  assert.ok(SEED_THOUGHTS.every((t) => t.isFallback === true));
  assert.ok(
    SEED_THOUGHTS.some(
      (t) => t.message === 'Grateful for the sudden sunlight after days of rain. It feels like hope.'
    )
  );
});

test('daily quota parses, decrements up to 5, blocks at limit, and resets when calendar date changes', () => {
  const day1 = getTodayDateKey(new Date(2026, 10, 17));
  const day2 = getTodayDateKey(new Date(2026, 10, 18));

  let quota = parseDailyQuota(null, day1);
  assert.equal(quota.count, 0);
  assert.equal(quota.date, day1);
  assert.equal(getRemainingThoughts(quota, day1), DAILY_THOUGHT_LIMIT);

  for (let i = 0; i < DAILY_THOUGHT_LIMIT; i++) {
    assert.equal(canReleaseThought(quota, day1), true);
    const res = consumeDailyQuota(quota, day1);
    assert.equal(res.allowed, true);
    quota = res.nextQuota;
  }

  assert.equal(quota.count, 5);
  assert.equal(getRemainingThoughts(quota, day1), 0);
  assert.equal(canReleaseThought(quota, day1), false);

  const blocked = consumeDailyQuota(quota, day1);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.nextQuota.count, 5);

  // When calendar date advances, quota resets cleanly
  const serialized = JSON.stringify(quota);
  const nextDayQuota = parseDailyQuota(serialized, day2);
  assert.equal(nextDayQuota.count, 0);
  assert.equal(nextDayQuota.date, day2);
  assert.equal(getRemainingThoughts(nextDayQuota, day2), DAILY_THOUGHT_LIMIT);
  assert.equal(canReleaseThought(nextDayQuota, day2), true);
});

test('validateThoughtInput rejects empty or >140 char strings and accepts trimmed valid thoughts', () => {
  assert.equal(validateThoughtInput('   ').valid, false);
  assert.equal(validateThoughtInput('').valid, false);
  assert.equal(validateThoughtInput('a'.repeat(MAX_THOUGHT_LENGTH + 1)).valid, false);

  const valid = validateThoughtInput('  Soft morning light on warm glass.  ');
  assert.equal(valid.valid, true);
  assert.equal(valid.trimmed, 'Soft morning light on warm glass.');
});

test('createBurstDroplets returns 10 to 14 droplets with finite non-zero scatter offsets', () => {
  const droplets = createBurstDroplets('Calm', 12, 3);
  assert.ok(droplets.length >= 10 && droplets.length <= 14);
  for (const d of droplets) {
    assert.ok(Number.isFinite(d.dx) && Number.isFinite(d.dy));
    assert.ok(Math.hypot(d.dx, d.dy) > 20);
    assert.ok(d.size >= 6);
  }
});

test('bubble physics stays bounded, separates 12 bubbles on desktop and 7 on mobile, and pauses hovered bubble', () => {
  assert.ok(getEffectiveBubbleDiameter(120, 390) < getEffectiveBubbleDiameter(120, 1440));

  const bounds = getSafeCanvasBounds(1440, 900);
  let states = createInitialBubbleStates(SEED_THOUGHTS, bounds);
  for (let i = 0; i < 5; i++) {
    const spawned = spawnBubbleFromBottom(
      {
        id: `user-${i}`,
        username: 'you',
        emotion: 'Hope',
        message: `Gentle reflection ${i}`,
        timestamp: '10:50 AM',
        warmthCount: 1,
        size: 122,
      },
      bounds,
      states
    );
    states = [...states, spawned];
  }

  for (let frame = 0; frame < 600; frame++) {
    states = stepBubblePhysics(states, bounds, 1 / 60);
  }

  for (const s of states) {
    assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y));
    assert.ok(s.x >= bounds.sideInset - 1 && s.x <= bounds.width - bounds.sideInset + 1);
    assert.ok(s.y >= bounds.topInset - 1 && s.y <= bounds.height - bounds.bottomInset + 26);
  }

  // Verify pausedId freezes that bubble cleanly
  const target = states[0];
  const afterPausedStep = stepBubblePhysics(states, bounds, 1 / 60, target.id);
  assert.equal(afterPausedStep[0].x, target.x);
  assert.equal(afterPausedStep[0].y, target.y);

  // Verify mobile 390x844 maintains clearance across the 7 initial bubbles
  const mobileBounds = getSafeCanvasBounds(390, 844);
  let mobileStates = createInitialBubbleStates(SEED_THOUGHTS, mobileBounds);
  for (let frame = 0; frame < 120; frame++) {
    mobileStates = stepBubblePhysics(mobileStates, mobileBounds, 1 / 60);
  }
  for (let i = 0; i < mobileStates.length; i++) {
    for (let j = i + 1; j < mobileStates.length; j++) {
      const dist = Math.hypot(
        mobileStates[i].x - mobileStates[j].x,
        mobileStates[i].y - mobileStates[j].y
      );
      assert.ok(
        dist > mobileStates[i].radius + mobileStates[j].radius,
        `Mobile bubbles ${mobileStates[i].id} and ${mobileStates[j].id} overlapped (dist=${dist})`
      );
    }
  }
});

import {
  EMOTION_PENTATONIC_HZ,
  MAJOR_NINTH_BELL_CHORD_HZ,
  computeRandomizedPopPitch,
  parseSoundPreference,
} from './soundEngine';

test('soundEngine provides pentatonic emotion notes, major-9th chord, ±8% pop randomization, and mute parsing', () => {
  assert.deepEqual(Object.values(EMOTION_PENTATONIC_HZ), [523.25, 587.33, 659.25, 783.99, 880]);
  assert.deepEqual([...MAJOR_NINTH_BELL_CHORD_HZ], [523.25, 659.25, 783.99, 987.77, 1174.66]);

  assert.equal(computeRandomizedPopPitch(280, 0), 257.6);
  assert.equal(computeRandomizedPopPitch(280, 0.5), 280);
  assert.equal(computeRandomizedPopPitch(280, 1), 302.4);

  assert.equal(parseSoundPreference(null), true);
  assert.equal(parseSoundPreference('true'), true);
  assert.equal(parseSoundPreference('false'), false);
  assert.equal(parseSoundPreference('0'), false);
});

test('getUtcDateKey formats UTC YYYY-MM-DD and deriveAuthorHandle produces valid @firstname handles', () => {
  const utcDate = getUtcDateKey(new Date('2026-11-17T23:45:00-08:00'));
  assert.equal(utcDate, '2026-11-18');
  assert.match(utcDate, DATE_KEY_PATTERN);

  assert.equal(deriveAuthorHandle('Lyra Vance'), '@lyra');
  assert.equal(deriveAuthorHandle('  Elara!  '), '@elara');
  assert.equal(deriveAuthorHandle(null, 'kai.zen@example.com'), '@kaizen');
  assert.equal(deriveAuthorHandle('   ', null), '@dreamer');
  assert.match(deriveAuthorHandle('VeryLongFirstNameExceedingThirtyTwoCharactersInTotal'), AUTHOR_HANDLE_PATTERN);
  assert.ok(deriveAuthorHandle('VeryLongFirstNameExceedingThirtyTwoCharactersInTotal').length <= 32);
  assert.equal(stripLeadingAt('@lyra'), 'lyra');

  const d = computeBubbleDiameter('doc-123', 42);
  assert.ok(d >= 110 && d <= 128);
});

test('reconcileBubblePhysics preserves existing positions and spawns newly streamed bubbles from bottom', () => {
  const bounds = getSafeCanvasBounds(1440, 900);
  const initialStates = reconcileBubblePhysics([], SEED_THOUGHTS, bounds);
  assert.equal(initialStates.length, SEED_THOUGHTS.length);

  const firstBefore = { ...initialStates[0] };
  const addedBubble = {
    id: 'streamed-new-1',
    username: 'sora',
    emotion: 'Hope' as const,
    message: 'Freshly streamed thought from Firestore.',
    timestamp: '02:10 PM',
    warmthCount: 0,
    size: 120,
  };

  const nextStates = reconcileBubblePhysics(initialStates, [...SEED_THOUGHTS, addedBubble], bounds);
  assert.equal(nextStates.length, SEED_THOUGHTS.length + 1);
  assert.equal(nextStates[0].x, firstBefore.x);
  assert.equal(nextStates[0].y, firstBefore.y);
  assert.equal(nextStates[nextStates.length - 1].id, 'streamed-new-1');
  assert.ok(nextStates[nextStates.length - 1].vy < 0);
});
