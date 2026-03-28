import { ENJOYED_POLICY_OPTIONS } from './constants';

export function labelForEnjoyedPolicyValue(v: string): string {
  const o = ENJOYED_POLICY_OPTIONS.find((x) => x.value === v);
  return o?.label ?? v;
}

export function mapProductCategoriesToCascader(nodes: any[]): any[] {
  if (!nodes?.length) return [];
  return nodes.map((n) => ({
    value: n.id,
    label: n.name,
    children: n.children?.length ? mapProductCategoriesToCascader(n.children) : undefined,
  }));
}

export function findProductCategoryPath(nodes: any[], targetId: any, path: any[] = []): any[] | null {
  for (const n of nodes || []) {
    const next = [...path, n.id];
    if (n.id === targetId) return next;
    if (n.children?.length) {
      const sub = findProductCategoryPath(n.children, targetId, next);
      if (sub) return sub;
    }
  }
  return null;
}

export function logEnterpriseDetail(step: string, payload?: Record<string, unknown>): void {
  if (payload) {
    console.info(`[EnterpriseDetail] ${step}`, payload);
    return;
  }
  console.info(`[EnterpriseDetail] ${step}`);
}

export function findIndustryCascaderPath(nodes: any[], targetId: unknown, path: number[] = []): number[] | null {
  if (targetId == null || targetId === '') return null;
  const tid = Number(targetId);
  if (Number.isNaN(tid)) return null;
  for (const n of nodes || []) {
    const val = n.value as number;
    const next = [...path, val];
    if (val === tid) return next;
    if (n.children?.length) {
      const sub = findIndustryCascaderPath(n.children, targetId, next);
      if (sub) return sub;
    }
  }
  return null;
}

export function makeCustomDictionaryValue(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function stripTrailingPercentForInput(v: unknown): string | undefined {
  if (v == null) return undefined;
  const t = String(v).trim();
  if (!t) return undefined;
  const s = t.replace(/\s*%+\s*$/g, '').trim();
  return s || undefined;
}

export function ensurePercentSuffix(v: unknown): string | undefined {
  if (v == null) return undefined;
  const t = String(v).trim();
  if (!t) return undefined;
  return /%\s*$/.test(t) ? t : `${t}%`;
}
