export interface CitySwitchTransactionDependencies<TSession> {
  selectCity: (cityId: number) => Promise<TSession>;
  applySession: (session: TSession) => void;
  resetScopedState: () => void;
  broadcast: (session: TSession) => void;
  onSwitchingChange: (switching: boolean) => void;
}

export interface CitySwitchTransaction<TSession> {
  switchCity: (cityId: number) => Promise<TSession>;
  isSwitching: () => boolean;
}

export function createCitySwitchTransaction<TSession>(
  dependencies: CitySwitchTransactionDependencies<TSession>,
): CitySwitchTransaction<TSession> {
  let inFlight: Promise<TSession> | null = null;

  return {
    switchCity(cityId) {
      if (inFlight) return inFlight;

      dependencies.onSwitchingChange(true);
      inFlight = dependencies.selectCity(cityId)
        .then((session) => {
          dependencies.applySession(session);
          dependencies.resetScopedState();
          dependencies.broadcast(session);
          return session;
        })
        .finally(() => {
          inFlight = null;
          dependencies.onSwitchingChange(false);
        });

      return inFlight;
    },
    isSwitching() {
      return inFlight !== null;
    },
  };
}
