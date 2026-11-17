import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

test('firestore.rules enforces Eight Pillars and Dirty Dozen invariants for /bubbles/{bubbleId}', () => {
  const content = fs.readFileSync(rulesPath, 'utf8');

  assert.match(content, /rules_version\s*=\s*'2'/);
  assert.match(content, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
  assert.match(content, /function isValidId\(id\)/);
  assert.match(content, /function isValidBubbleSchema\(data\)/);
  assert.match(content, /data\.keys\(\)\.hasAll\(/);
  assert.match(content, /data\.keys\(\)\.hasOnly\(/);
  assert.match(content, /data\.text\.size\(\)\s*<=\s*140/);
  assert.match(content, /incoming\(\)\.uid == request\.auth\.uid/);
  assert.match(content, /request\.auth\.token\.email_verified == true/);
  assert.match(content, /incoming\(\)\.createdAt == request\.time/);
  assert.match(content, /incoming\(\)\.warmthCount == 0/);
  assert.match(content, /affectedKeys\(\)\.hasOnly\(\['warmthCount'\]\)/);
  assert.match(content, /incoming\(\)\.warmthCount == existing\(\)\.warmthCount \+ 1/);
  assert.match(content, /request\.query\.limit is int && request\.query\.limit <= 25/);
  assert.match(content, /allow delete: if false;/);
});
