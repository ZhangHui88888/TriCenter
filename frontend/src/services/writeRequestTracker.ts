import { useCitySwitchGuardStore } from '../stores/citySwitchGuardStore.ts';

const WRITE_GUARD_ID = 'network-write-request';
let pendingWriteCount = 0;

function syncGuard() {
  useCitySwitchGuardStore.getState().setBusy(
    WRITE_GUARD_ID,
    '正在提交数据',
    pendingWriteCount > 0,
  );
}

export function beginWriteRequest() {
  pendingWriteCount += 1;
  syncGuard();
}

export function endWriteRequest() {
  pendingWriteCount = Math.max(0, pendingWriteCount - 1);
  syncGuard();
}

export function isWriteMethod(method?: string) {
  return ['post', 'put', 'patch', 'delete'].includes((method || 'get').toLowerCase());
}

export function resetWriteRequestTrackerForTest() {
  pendingWriteCount = 0;
  syncGuard();
}
