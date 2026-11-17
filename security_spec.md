# AETHERIA Firestore Security Specification

## 1. Data Invariants (`/bubbles/{bubbleId}`)
- `bubbles` documents are publicly readable (`get` and `list`) so visitors can view and pop floating thoughts without signing in.
- No PII (`email`, `phone`, `address`) is stored in `bubbles`; only the non-sensitive `@firstname` handle (`authorHandle`) and `uid` are recorded.
- Document creation requires an authenticated Google user (`request.auth != null && request.auth.token.email_verified == true`).
- `uid` on creation must strictly equal `request.auth.uid`.
- `text` must be a non-empty string with length `1..140`.
- `emotion` must be one of `Calm`, `Joy`, `Peace`, `Melancholy`, `Hope`.
- `createdAt` must strictly equal `request.time` (server timestamp).
- `dateKey` must match `^\d{4}-\d{2}-\d{2}$` (UTC `YYYY-MM-DD`).
- `warmthCount` on creation must be an integer equal to `0`.
- Updates are restricted to **only** incrementing `warmthCount` by exactly `+1` (`incoming().warmthCount == existing().warmthCount + 1`), with all other fields (`uid`, `authorHandle`, `text`, `emotion`, `createdAt`, `dateKey`) immutable.
- Deletes are forbidden for all client SDKs.

## 2. The "Dirty Dozen" Attack Payloads (All Must Yield `PERMISSION_DENIED`)
1. **Unauthenticated Create**: Creating a bubble with `request.auth == null`.
2. **UID Spoofing**: Creating a bubble where `uid` does not match `request.auth.uid`.
3. **Unverified Email**: Creating a bubble with `request.auth.token.email_verified == false`.
4. **Oversized Thought**: Creating a bubble where `text.size() == 141`.
5. **Empty Thought**: Creating a bubble where `text.size() == 0`.
6. **Invalid Emotion**: Creating a bubble with `emotion: "Rage"`.
7. **Shadow / Ghost Field Injection**: Creating a bubble with an extra field `{ ..., isAdmin: true }`.
8. **Client-Forged Timestamp**: Creating a bubble with a backdated `createdAt` instead of `request.time`.
9. **Pre-Inflated Warmth**: Creating a bubble with `warmthCount: 99` instead of `0`.
10. **Text/Author Hijack on Update**: Updating `text` or `authorHandle` alongside `warmthCount`.
11. **Warmth Decrement / Arbitrary Jump**: Updating `warmthCount` by `-1` or `+50` instead of `+1`.
12. **Client Delete / Poisoned Document ID**: Deleting any bubble or creating at `/bubbles/invalid id with spaces!`.
