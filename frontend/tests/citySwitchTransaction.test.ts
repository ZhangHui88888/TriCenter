import assert from 'node:assert/strict'
import test from 'node:test'
import { createCitySwitchTransaction } from '../src/services/citySwitchTransaction.ts'

type Session = { token: string; currentCityId: number }

test('applies and broadcasts a city session only after the API succeeds', async () => {
  const events: string[] = []
  const transaction = createCitySwitchTransaction<Session>({
    selectCity: async cityId => ({ token: 'new-token', currentCityId: cityId }),
    applySession: session => events.push(`apply:${session.currentCityId}`),
    resetScopedState: () => events.push('reset'),
    broadcast: session => events.push(`broadcast:${session.currentCityId}`),
    onSwitchingChange: switching => events.push(`switching:${switching}`),
  })

  const session = await transaction.switchCity(2)

  assert.deepEqual(session, { token: 'new-token', currentCityId: 2 })
  assert.deepEqual(events, [
    'switching:true',
    'apply:2',
    'reset',
    'broadcast:2',
    'switching:false',
  ])
})

test('deduplicates concurrent switch requests', async () => {
  let calls = 0
  let resolveRequest!: (session: Session) => void
  const pending = new Promise<Session>(resolve => { resolveRequest = resolve })
  const transaction = createCitySwitchTransaction<Session>({
    selectCity: async () => { calls += 1; return pending },
    applySession: () => undefined,
    resetScopedState: () => undefined,
    broadcast: () => undefined,
    onSwitchingChange: () => undefined,
  })

  const first = transaction.switchCity(2)
  const second = transaction.switchCity(2)
  resolveRequest({ token: 'new-token', currentCityId: 2 })

  assert.equal(first, second)
  await first
  assert.equal(calls, 1)
})

test('keeps the current session untouched when switching fails', async () => {
  const events: string[] = []
  const transaction = createCitySwitchTransaction<Session>({
    selectCity: async () => { throw new Error('forbidden') },
    applySession: () => events.push('apply'),
    resetScopedState: () => events.push('reset'),
    broadcast: () => events.push('broadcast'),
    onSwitchingChange: switching => events.push(`switching:${switching}`),
  })

  await assert.rejects(transaction.switchCity(2), /forbidden/)
  assert.deepEqual(events, ['switching:true', 'switching:false'])
})
