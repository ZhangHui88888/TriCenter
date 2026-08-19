import assert from 'node:assert/strict'
import test from 'node:test'
import { useCitySwitchGuardStore } from '../src/stores/citySwitchGuardStore.ts'

test('tracks dirty and busy write sources independently', () => {
  const store = useCitySwitchGuardStore.getState()
  store.reset()

  store.setDirty('enterprise-create', '新增企业', true)
  store.setBusy('follow-up-save', '保存跟进', true)

  assert.equal(useCitySwitchGuardStore.getState().hasDirty(), true)
  assert.equal(useCitySwitchGuardStore.getState().hasBusy(), true)
  assert.deepEqual(useCitySwitchGuardStore.getState().dirtyLabels(), ['新增企业'])

  store.setDirty('enterprise-create', '新增企业', false)
  store.setBusy('follow-up-save', '保存跟进', false)
  assert.equal(useCitySwitchGuardStore.getState().hasDirty(), false)
  assert.equal(useCitySwitchGuardStore.getState().hasBusy(), false)
})

test('reset removes stale blockers after a successful city switch', () => {
  const store = useCitySwitchGuardStore.getState()
  store.setDirty('draft', '草稿', true)
  store.setBusy('save', '保存', true)
  store.setSwitching(true)

  store.reset()

  const state = useCitySwitchGuardStore.getState()
  assert.deepEqual(state.dirtySources, {})
  assert.deepEqual(state.busySources, {})
  assert.equal(state.switching, false)
})
