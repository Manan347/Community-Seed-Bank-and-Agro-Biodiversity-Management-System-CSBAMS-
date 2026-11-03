import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveInventoryStatus, deriveQualityStatus } from '../utils/helpers.js';
import db from '../config/db.js';

test('inventory status follows quantity and threshold', () => {
  assert.equal(deriveInventoryStatus(12, 5), 'Available');
  assert.equal(deriveInventoryStatus(5, 5), 'LowStock');
  assert.equal(deriveInventoryStatus(0, 5), 'OutOfStock');
});

test('quality status selects the worst quality result', () => {
  assert.equal(deriveQualityStatus({ germination: 90, purity: 99, moisture: 11 }), 'Good');
  assert.equal(deriveQualityStatus({ germination: 80, purity: 99, moisture: 11 }), 'Average');
  assert.equal(deriveQualityStatus({ germination: 90, purity: 94, moisture: 11 }), 'Poor');
  assert.equal(deriveQualityStatus({ germination: 90, purity: 99, moisture: 15 }), 'Poor');
});

test('seeded demonstration data contains all core records', () => {
  const record = db.prepare(`SELECT
    (SELECT count(*) FROM users) AS users,
    (SELECT count(*) FROM seed_varieties) AS varieties,
    (SELECT count(*) FROM quality_tests) AS tests,
    (SELECT count(*) FROM loan_transactions) AS loans,
    (SELECT count(*) FROM community_events) AS events,
    (SELECT count(*) FROM knowledge_articles) AS articles`).get();
  assert.equal(record.users, 5);
  assert.equal(record.varieties, 3);
  assert.equal(record.tests, 2);
  assert.ok(record.loans >= 1);
  assert.ok(record.events >= 2);
  assert.ok(record.articles >= 2);
});
