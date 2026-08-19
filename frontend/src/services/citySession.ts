import { authApi } from '@/services/api';
import { publishAuthSync } from '@/services/authSync';
import { createCitySwitchTransaction } from '@/services/citySwitchTransaction';
import { useAuthStore } from '@/stores/authStore';
import { useCitySwitchGuardStore } from '@/stores/citySwitchGuardStore';
import { useEnterpriseListStore } from '@/stores/enterpriseListStore';
import type { LoginResponseData } from '@/types/auth';

export const citySwitchTransaction = createCitySwitchTransaction<LoginResponseData>({
  selectCity: async (cityId) => {
    const response = await authApi.selectCity(cityId);
    return response.data as LoginResponseData;
  },
  applySession: (session) => useAuthStore.getState().setAuth(session),
  resetScopedState: () => {
    useEnterpriseListStore.getState().resetFilters();
    useCitySwitchGuardStore.getState().reset();
  },
  broadcast: (session) => publishAuthSync(
    'CITY_CHANGED',
    '/dashboard',
    session.currentCity?.id,
  ),
  onSwitchingChange: (switching) => {
    useCitySwitchGuardStore.getState().setSwitching(switching);
  },
});
