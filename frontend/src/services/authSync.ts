export type AuthSyncKind = 'SESSION_CHANGED' | 'CITY_CHANGED' | 'AUTH_CLEARED';
export type AuthSyncTargetPath = '/login' | '/select-city' | '/dashboard';

export interface AuthSyncEvent {
  version: 1;
  eventId: string;
  kind: AuthSyncKind;
  sourceTabId: string;
  currentCityId?: number;
  targetPath: AuthSyncTargetPath;
  timestamp: number;
}

interface AuthSyncEventOptions {
  sourceTabId: string;
  currentCityId?: number;
  targetPath: AuthSyncTargetPath;
  timestamp?: number;
  eventId?: string;
}

const CHANNEL_NAME = 'tricenter-auth';
const STORAGE_KEY = 'tricenter-auth-sync-event';
const supportedKinds = new Set<AuthSyncKind>([
  'SESSION_CHANGED',
  'CITY_CHANGED',
  'AUTH_CLEARED',
]);
const supportedTargets = new Set<AuthSyncTargetPath>([
  '/login',
  '/select-city',
  '/dashboard',
]);

const randomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// 每个页面运行实例都生成独立 ID，避免“复制标签页”时 sessionStorage 被克隆导致彼此误判为同一标签。
const runtimeTabId = randomId();

export function getAuthTabId(): string {
  return runtimeTabId;
}

export function createAuthSyncEvent(
  kind: AuthSyncKind,
  options: AuthSyncEventOptions,
): AuthSyncEvent {
  return {
    version: 1,
    eventId: options.eventId ?? randomId(),
    kind,
    sourceTabId: options.sourceTabId,
    ...(options.currentCityId == null ? {} : { currentCityId: options.currentCityId }),
    targetPath: options.targetPath,
    timestamp: options.timestamp ?? Date.now(),
  };
}

export function parseAuthSyncEvent(serialized: string | null): AuthSyncEvent | null {
  if (!serialized) return null;
  try {
    const value = JSON.parse(serialized) as Partial<AuthSyncEvent>;
    if (value.version !== 1
      || typeof value.eventId !== 'string'
      || !supportedKinds.has(value.kind as AuthSyncKind)
      || typeof value.sourceTabId !== 'string'
      || !supportedTargets.has(value.targetPath as AuthSyncTargetPath)
      || typeof value.timestamp !== 'number') {
      return null;
    }
    if (value.currentCityId != null && typeof value.currentCityId !== 'number') {
      return null;
    }
    return value as AuthSyncEvent;
  } catch {
    return null;
  }
}

export function parseAuthSyncMessage(value: unknown): AuthSyncEvent | null {
  try {
    return parseAuthSyncEvent(JSON.stringify(value));
  } catch {
    return null;
  }
}

export function publishAuthSync(
  kind: AuthSyncKind,
  targetPath: AuthSyncTargetPath,
  currentCityId?: number,
): AuthSyncEvent {
  const event = createAuthSyncEvent(kind, {
    sourceTabId: getAuthTabId(),
    currentCityId,
    targetPath,
  });

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
  }
  return event;
}

export function subscribeAuthSync(listener: (event: AuthSyncEvent) => void): () => void {
  const currentTabId = getAuthTabId();
  const handled = new Set<string>();
  const deliver = (event: AuthSyncEvent | null) => {
    if (!event || event.sourceTabId === currentTabId || handled.has(event.eventId)) return;
    handled.add(event.eventId);
    if (handled.size > 100) {
      const oldestEventId = handled.values().next().value;
      if (oldestEventId) handled.delete(oldestEventId);
    }
    listener(event);
  };

  const channel = typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel(CHANNEL_NAME);
  if (channel) {
    channel.onmessage = (message: MessageEvent<unknown>) => deliver(parseAuthSyncMessage(message.data));
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) deliver(parseAuthSyncEvent(event.newValue));
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    channel?.close();
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}
