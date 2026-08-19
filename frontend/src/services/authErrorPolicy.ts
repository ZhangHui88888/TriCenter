export type AuthErrorAction =
  | { type: 'none' }
  | { type: 'redirect'; targetPath: '/login' | '/select-city'; clearSession: boolean };

export function getAuthErrorAction(
  status: number,
  errorKey: string | undefined,
  pathname: string,
): AuthErrorAction {
  if (errorKey === 'CITY_SELECTION_REQUIRED') {
    return { type: 'redirect', targetPath: '/select-city', clearSession: false };
  }
  if (errorKey === 'CITY_ACCESS_REVOKED'
    || errorKey === 'TOKEN_EXPIRED'
    || errorKey === 'ACCOUNT_DISABLED') {
    return { type: 'redirect', targetPath: '/login', clearSession: true };
  }
  if (status === 401 && pathname !== '/login') {
    return { type: 'redirect', targetPath: '/login', clearSession: true };
  }
  return { type: 'none' };
}
