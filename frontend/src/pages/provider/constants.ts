import { requirements } from '@/data/requirementsData';

export const COOPERATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '合作中', color: 'green' },
  SUSPENDED: { label: '已暂停', color: 'orange' },
  TERMINATED: { label: '已终止', color: 'red' },
};

export type SelectOption = { label: string; value: number | string };

function buildRequirementTree() {
  const phaseMap = new Map<string, Map<string, { id: string; name: string }[]>>();

  for (const item of requirements) {
    if (!phaseMap.has(item.phase)) {
      phaseMap.set(item.phase, new Map());
    }
    const categoryMap = phaseMap.get(item.phase)!;
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  }

  return Array.from(phaseMap.entries()).map(([phase, categoryMap]) => ({
    title: phase,
    value: `phase_${phase}`,
    selectable: false,
    children: Array.from(categoryMap.entries()).map(([category, items]) => ({
      title: category,
      value: `cat_${phase}_${category}`,
      selectable: false,
      children: items.map((item) => ({
        title: `${item.id} ${item.name}`,
        value: item.id,
      })),
    })),
  }));
}

export const requirementTreeData = buildRequirementTree();
export const requirementNameMap = new Map(requirements.map((item) => [item.id, item.name]));

export function getRequirementNames(ids?: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [] as string[];
  }

  return ids.map((id) => requirementNameMap.get(id) || id);
}

export function getCooperationStatusLabel(status?: string) {
  if (!status) {
    return '-';
  }

  return COOPERATION_STATUS_MAP[status]?.label || status;
}
