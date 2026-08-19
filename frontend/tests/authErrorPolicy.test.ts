import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuthErrorAction } from '../src/services/authErrorPolicy.ts';

test('ordinary business 403 does not clear or redirect the session', () => {
  assert.deepEqual(getAuthErrorAction(403, undefined, '/enterprise'), { type: 'none' });
});

test('city selection requirement preserves the pending session', () => {
  assert.deepEqual(getAuthErrorAction(403, 'CITY_SELECTION_REQUIRED', '/enterprise'), {
    type: 'redirect',
    targetPath: '/select-city',
    clearSession: false,
  });
});

test('revoked city, expired token and disabled account clear the session', () => {
  for (const key of ['CITY_ACCESS_REVOKED', 'TOKEN_EXPIRED', 'ACCOUNT_DISABLED']) {
    assert.deepEqual(getAuthErrorAction(403, key, '/dashboard'), {
      type: 'redirect',
      targetPath: '/login',
      clearSession: true,
    });
  }
});
