import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { useCitySwitchGuardStore } from '@/stores/citySwitchGuardStore';

interface CitySwitchGuardOptions {
  id: string;
  label: string;
  dirty: boolean;
  busy?: boolean;
}

interface AntFormCitySwitchGuardOptions {
  id: string;
  label: string;
  form: FormInstance;
  active: boolean;
  busy?: boolean;
  extraDirty?: boolean;
}

export function useCitySwitchGuard({
  id,
  label,
  dirty,
  busy = false,
}: CitySwitchGuardOptions) {
  const setDirty = useCitySwitchGuardStore((state) => state.setDirty);
  const setBusy = useCitySwitchGuardStore((state) => state.setBusy);

  useEffect(() => {
    setDirty(id, label, dirty);
    return () => setDirty(id, label, false);
  }, [dirty, id, label, setDirty]);

  useEffect(() => {
    setBusy(id, label, busy);
    return () => setBusy(id, label, false);
  }, [busy, id, label, setBusy]);
}

export function useAntFormCitySwitchGuard({
  id,
  label,
  form,
  active,
  busy = false,
  extraDirty = false,
}: AntFormCitySwitchGuardOptions) {
  Form.useWatch([], form);
  useCitySwitchGuard({
    id,
    label,
    dirty: active && (form.isFieldsTouched() || extraDirty),
    busy,
  });
}

interface CitySwitchValueGuardOptions<T> {
  id: string;
  label: string;
  active: boolean;
  value: T;
  baselineValue?: T;
  busy?: boolean;
}

export function useCitySwitchValueGuard<T>({
  id,
  label,
  active,
  value,
  baselineValue,
  busy = false,
}: CitySwitchValueGuardOptions<T>) {
  const activeRef = useRef(false);
  const baselineRef = useRef('');
  const serializedValue = JSON.stringify(value);
  const serializedBaselineValue = JSON.stringify(baselineValue ?? value);

  if (active && !activeRef.current) {
    baselineRef.current = serializedBaselineValue;
  }
  activeRef.current = active;

  useCitySwitchGuard({
    id,
    label,
    dirty: active && baselineRef.current !== serializedValue,
    busy,
  });
}
