import { useEffect } from 'react';
import { subscribeAuthSync } from '@/services/authSync';
import { useCitySwitchGuardStore } from '@/stores/citySwitchGuardStore';

export default function AuthSyncListener() {
  useEffect(() => subscribeAuthSync((event) => {
    useCitySwitchGuardStore.getState().reset();
    window.location.replace(event.targetPath);
  }), []);

  return null;
}
