import { test } from 'vitest';
import assert from 'node:assert/strict';
import { useCitySwitchGuardStore } from '../src/stores/citySwitchGuardStore.ts';
import {
  beginWriteRequest,
  endWriteRequest,
  isWriteMethod,
  resetWriteRequestTrackerForTest,
} from '../src/services/writeRequestTracker.ts';

test('tracks concurrent write requests until the last request settles', () => {
  resetWriteRequestTrackerForTest();
  beginWriteRequest();
  beginWriteRequest();
  assert.equal(useCitySwitchGuardStore.getState().hasBusy(), true);

  endWriteRequest();
  assert.equal(useCitySwitchGuardStore.getState().hasBusy(), true);

  endWriteRequest();
  assert.equal(useCitySwitchGuardStore.getState().hasBusy(), false);
});

test('only mutating HTTP methods count as write requests', () => {
  assert.equal(isWriteMethod('GET'), false);
  assert.equal(isWriteMethod('post'), true);
  assert.equal(isWriteMethod('PUT'), true);
  assert.equal(isWriteMethod('patch'), true);
  assert.equal(isWriteMethod('DELETE'), true);
});
