import { create } from 'zustand';

interface CitySwitchGuardState {
  dirtySources: Record<string, string>;
  busySources: Record<string, string>;
  switching: boolean;
  setDirty: (id: string, label: string, dirty: boolean) => void;
  setBusy: (id: string, label: string, busy: boolean) => void;
  setSwitching: (switching: boolean) => void;
  hasDirty: () => boolean;
  hasBusy: () => boolean;
  dirtyLabels: () => string[];
  reset: () => void;
}

const withoutKey = (source: Record<string, string>, id: string) => {
  const next = { ...source };
  delete next[id];
  return next;
};

export const useCitySwitchGuardStore = create<CitySwitchGuardState>()((set, get) => ({
  dirtySources: {},
  busySources: {},
  switching: false,
  setDirty: (id, label, dirty) => set((state) => ({
    dirtySources: dirty
      ? { ...state.dirtySources, [id]: label }
      : withoutKey(state.dirtySources, id),
  })),
  setBusy: (id, label, busy) => set((state) => ({
    busySources: busy
      ? { ...state.busySources, [id]: label }
      : withoutKey(state.busySources, id),
  })),
  setSwitching: (switching) => set({ switching }),
  hasDirty: () => Object.keys(get().dirtySources).length > 0,
  hasBusy: () => Object.keys(get().busySources).length > 0,
  dirtyLabels: () => [...new Set(Object.values(get().dirtySources))],
  reset: () => set({ dirtySources: {}, busySources: {}, switching: false }),
}));
