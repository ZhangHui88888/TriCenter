import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAuthSyncEvent,
  getAuthTabId,
  parseAuthSyncEvent,
  parseAuthSyncMessage,
  subscribeAuthSync,
} from '../src/services/authSync.ts'

test('creates a versioned auth event without embedding a token', () => {
  const event = createAuthSyncEvent('CITY_CHANGED', {
    sourceTabId: 'tab-a',
    currentCityId: 2,
    targetPath: '/dashboard',
    timestamp: 123,
    eventId: 'event-1',
  })

  assert.deepEqual(event, {
    version: 1,
    kind: 'CITY_CHANGED',
    sourceTabId: 'tab-a',
    currentCityId: 2,
    targetPath: '/dashboard',
    timestamp: 123,
    eventId: 'event-1',
  })
  assert.equal('token' in event, false)
})

test('uses a page-runtime tab id that does not depend on cloned session storage', () => {
  assert.equal(getAuthTabId(), getAuthTabId())
  assert.notEqual(getAuthTabId(), 'server')
})

test('parses supported events and rejects malformed or future versions', () => {
  const valid = JSON.stringify(createAuthSyncEvent('AUTH_CLEARED', {
    sourceTabId: 'tab-a',
    targetPath: '/login',
    timestamp: 123,
    eventId: 'event-2',
  }))

  assert.equal(parseAuthSyncEvent(valid)?.kind, 'AUTH_CLEARED')
  assert.equal(parseAuthSyncEvent('{bad json'), null)
  assert.equal(parseAuthSyncEvent(JSON.stringify({ version: 2, kind: 'CITY_CHANGED' })), null)
  assert.equal(parseAuthSyncMessage({ targetPath: 'https://example.com' }), null)
})

test('delivers a remote tab event once and ignores malformed or same-tab messages', () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel
  const instances: FakeBroadcastChannel[] = []
  class FakeBroadcastChannel {
    onmessage: ((message: MessageEvent<unknown>) => void) | null = null
    constructor(_name: string) { instances.push(this) }
    close() {}
  }
  globalThis.BroadcastChannel = FakeBroadcastChannel as unknown as typeof BroadcastChannel

  const received: string[] = []
  const unsubscribe = subscribeAuthSync(event => received.push(event.eventId))
  const channel = instances[0]
  const remote = createAuthSyncEvent('CITY_CHANGED', {
    sourceTabId: 'tab-b',
    currentCityId: 2,
    targetPath: '/dashboard',
    eventId: 'remote-1',
  })
  channel.onmessage?.({ data: remote } as MessageEvent<unknown>)
  channel.onmessage?.({ data: remote } as MessageEvent<unknown>)
  channel.onmessage?.({ data: { version: 1, targetPath: 'https://example.com' } } as MessageEvent<unknown>)
  channel.onmessage?.({
    data: createAuthSyncEvent('CITY_CHANGED', {
      sourceTabId: getAuthTabId(),
      targetPath: '/dashboard',
      eventId: 'same-tab',
    }),
  } as MessageEvent<unknown>)

  assert.deepEqual(received, ['remote-1'])
  unsubscribe()
  globalThis.BroadcastChannel = originalBroadcastChannel
})
