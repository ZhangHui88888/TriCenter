import { groupRequirementsByPhase, type RequirementItem } from '@/data/requirementsData';
import { DIMENSION_LABELS, PHASES, PHASE_COLORS } from './constants';
import type {
  EnterpriseCustomRequirement,
  RequirementDisplayMode,
  RequirementPhaseGroup,
  RequirementRecord,
  RequirementStatFilterKey,
  RequirementStatItem,
  RequirementViewData,
} from './types';
import type { RequirementConfigData } from '@/services/api';

interface BuildRequirementViewOptions {
  reqConfig: RequirementConfigData;
  dimensionSelections: Record<string, string[]>;
  removedRequirements: string[];
  addedRequirements: string[];
  customRequirements: EnterpriseCustomRequirement[];
  displayMode: RequirementDisplayMode;
  activeFilters: RequirementStatFilterKey[];
}

interface RequirementSourceBuckets {
  universal: RequirementRecord[];
  enhanced: RequirementRecord[];
  dimensional: RequirementRecord[];
  all: RequirementRecord[];
}

interface RequirementBucketBuildResult {
  raw: RequirementSourceBuckets;
  filtered: RequirementSourceBuckets;
}

function uniqById<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item, index, self) => self.findIndex(candidate => candidate.id === item.id) === index);
}

function createRequirementSourcesGetter(
  result: RequirementSourceBuckets,
  dimensionSelections: Record<string, string[]>,
  dimensionRequirementMapping: Record<string, Record<string, string[]>>,
) {
  return (reqId: string): string[] => {
    const sources: string[] = [];
    if (result.universal.some(item => item.id === reqId)) sources.push('通用必选');
    if (result.enhanced.some(item => item.id === reqId)) sources.push('增强项');

    Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
      if (!selectedValues?.length) return;
      const dimMapping = dimensionRequirementMapping[dimKey];
      if (!dimMapping) return;

      selectedValues.forEach(value => {
        if (dimMapping[value]?.includes(reqId)) {
          const label = DIMENSION_LABELS[dimKey]?.[value] || value;
          if (!sources.includes(label)) {
            sources.push(label);
          }
        }
      });
    });

    return sources;
  };
}

function buildSourceBuckets(
  reqConfig: RequirementConfigData,
  dimensionSelections: Record<string, string[]>,
  removedRequirements: string[],
): RequirementBucketBuildResult {
  const { requirements: dbRequirements, universalRequiredIds, universalEnhancedIds, dimensionRequirementMapping } = reqConfig;
  const requirementIds = new Set<string>(universalRequiredIds);

  Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
    if (!selectedValues?.length) return;
    const dimMapping = dimensionRequirementMapping[dimKey];
    if (!dimMapping) return;

    selectedValues.forEach(value => {
      dimMapping[value]?.forEach(id => requirementIds.add(id));
    });
  });

  const universalSet = new Set(universalRequiredIds);
  const enhancedSet = new Set(universalEnhancedIds);
  const isNotRemoved = (req: RequirementRecord) => !removedRequirements.includes(req.id);

  const raw: RequirementSourceBuckets = {
    universal: dbRequirements.filter(req => universalSet.has(req.id)),
    enhanced: dbRequirements.filter(req => enhancedSet.has(req.id)),
    dimensional: dbRequirements.filter(req => requirementIds.has(req.id) && !universalSet.has(req.id) && !enhancedSet.has(req.id)),
    all: dbRequirements.filter(req => requirementIds.has(req.id)),
  };

  const filtered: RequirementSourceBuckets = {
    universal: raw.universal.filter(isNotRemoved),
    enhanced: raw.enhanced.filter(isNotRemoved),
    dimensional: raw.dimensional.filter(isNotRemoved),
    all: raw.all.filter(isNotRemoved),
  };

  return {
    raw,
    filtered,
  };
}

function filterVisibleRequirements(
  activeFilters: RequirementStatFilterKey[],
  result: RequirementSourceBuckets,
  allRequirements: RequirementRecord[],
) {
  if (activeFilters.includes('all')) {
    return uniqById(allRequirements);
  }

  const visible: RequirementRecord[] = [];
  if (activeFilters.includes('universal')) {
    visible.push(...result.universal);
  }
  if (activeFilters.includes('enhanced')) {
    visible.push(...result.enhanced);
  }
  if (activeFilters.includes('dimensional')) {
    visible.push(...result.dimensional);
  }

  return uniqById(visible);
}

export function toggleRequirementStatFilter(
  current: RequirementStatFilterKey[],
  key: RequirementStatFilterKey,
): RequirementStatFilterKey[] {
  if (key === 'all') {
    return ['all'];
  }

  const next = current.includes('all') ? [] : [...current];
  const exists = next.includes(key);
  const filtered = exists ? next.filter(item => item !== key) : [...next, key];
  return filtered.length > 0 ? filtered : ['all'];
}

export function getRequirementStatItems(
  viewData: RequirementViewData,
  customCount: number,
  displayMode: RequirementDisplayMode,
): RequirementStatItem[] {
  const visibleCount = viewData.visibleRequirements.length + customCount;
  
  return [
    {
      key: 'all',
      label: displayMode === 'all' ? '需求总数' : displayMode === 'dimension' ? '匹配需求总数' : displayMode === 'template' ? '推荐模板需求总数' : '已确认需求总数',
      value: visibleCount,
      color: '#667eea',
      bg: 'rgba(102,126,234,0.05)',
      border: 'rgba(102,126,234,0.2)',
    },
    {
      key: 'universal',
      label: '通用必选需求',
      value: viewData.filteredUniversalCount,
      color: '#43e97b',
      bg: 'rgba(67,233,123,0.05)',
      border: 'rgba(67,233,123,0.2)',
    },
    {
      key: 'enhanced',
      label: '增强项需求',
      value: viewData.filteredEnhancedCount,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.05)',
      border: 'rgba(249,115,22,0.2)',
    },
    {
      key: 'dimensional',
      label: '差异化需求',
      value: viewData.hasSelection ? viewData.dimensionalCount : 0,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.05)',
      border: 'rgba(139,92,246,0.2)',
    },
  ];
}

export function buildRequirementViewData({
  reqConfig,
  dimensionSelections,
  removedRequirements,
  addedRequirements,
  customRequirements,
  displayMode,
  activeFilters,
}: BuildRequirementViewOptions): RequirementViewData {
  const { requirements: dbRequirements, dimensionRequirementMapping } = reqConfig;
  const recommendedIds = new Set(dbRequirements.filter(item => item.isRecommended === 1).map(item => item.id));
  const hasSelection = Object.values(dimensionSelections).some(values => values?.length > 0);
  const { raw, filtered } = buildSourceBuckets(reqConfig, dimensionSelections, removedRequirements);
  const getRequirementSources = createRequirementSourcesGetter(raw, dimensionSelections, dimensionRequirementMapping);

  const allRequirements = uniqById([...filtered.universal, ...filtered.enhanced, ...filtered.all]);
  const filterScopedRequirements = filterVisibleRequirements(activeFilters, filtered, allRequirements);
  
  // 根据显示模式计算可见需求
  // default: 只显示企业已确认的需求（addedRequirements），初始为空
  // template: 显示推荐模板中的需求（isRecommended），辅助增删
  // dimension: 显示根据维度匹配的全部需求，辅助增删
  // all: 显示所有需求项，辅助增删
  const allRawRequirements = uniqById([...raw.universal, ...raw.enhanced, ...raw.all]);
  const filterScopedRawRequirements = filterVisibleRequirements(activeFilters, raw, allRawRequirements);
  const addedSet = new Set(addedRequirements);
  const removedSet = new Set(removedRequirements);
  // 默认模式的可见需求：仅 addedRequirements（企业已确认的需求）
  const defaultVisibleRequirements = uniqById(
    dbRequirements.filter(item => addedSet.has(item.id) && !removedSet.has(item.id))
  );
  const defaultVisibleIds = new Set(defaultVisibleRequirements.map(item => item.id));
  // 推荐模板的可见需求：isRecommended=1 的需求
  const templateVisibleRequirements = uniqById(
    dbRequirements.filter(item => recommendedIds.has(item.id))
  );

  let visibleRequirements: RequirementRecord[];
  if (displayMode === 'all') {
    visibleRequirements = dbRequirements;
  } else if (displayMode === 'dimension') {
    visibleRequirements = filterScopedRawRequirements;
  } else if (displayMode === 'template') {
    visibleRequirements = templateVisibleRequirements;
  } else {
    visibleRequirements = defaultVisibleRequirements;
  }

  const groupedByPhase = groupRequirementsByPhase(visibleRequirements as RequirementItem[]);
  const allMatchedByPhase: Record<string, RequirementRecord[]> = {};

  dbRequirements.forEach(req => {
    if (!allMatchedByPhase[req.phase]) {
      allMatchedByPhase[req.phase] = [];
    }
    if (!allMatchedByPhase[req.phase].some(item => item.id === req.id)) {
      allMatchedByPhase[req.phase].push(req);
    }
  });

  const restorableRequirementsByCategory: Record<string, RequirementRecord[]> = {};
  const phaseGroups: RequirementPhaseGroup[] = PHASES.map<RequirementPhaseGroup>(phase => {
    const phaseRequirements = (groupedByPhase[phase] || []) as RequirementRecord[];
    const allPhaseReqs = allMatchedByPhase[phase] || [];
    const removedInPhase = allPhaseReqs.filter(item => removedRequirements.includes(item.id));

    const categories: Record<string, RequirementRecord[]> = {};
    phaseRequirements.forEach(req => {
      if (!categories[req.category]) {
        categories[req.category] = [];
      }
      categories[req.category].push(req);
    });

    const categoryEntries = Object.entries(categories).filter(([, items]) => items.length > 0);

    return {
      key: phase,
      phase,
      count: phaseRequirements.length,
      removedCount: removedInPhase.length,
      removedIds: removedInPhase.map(item => item.id),
      categories: categoryEntries.map(([category, items]) => {
        const key = `${phase}__${category}`;
        const restorableItems = allPhaseReqs.filter(item => item.category === category && removedRequirements.includes(item.id));
        restorableRequirementsByCategory[key] = restorableItems;
        return {
          key,
          phase,
          category,
          items: items.map(item => ({
            ...item,
            sources: getRequirementSources(item.id),
          })),
          removedCount: restorableItems.length,
          restorableItems,
        };
      }),
    };
  }).filter(g => g.categories.length > 0);

  customRequirements.forEach(item => {
    const key = `${item.phase}__${item.category}`;
    if (!restorableRequirementsByCategory[key]) {
      restorableRequirementsByCategory[key] = [];
    }
  });

  return {
    filteredUniversalCount: filtered.universal.length,
    filteredEnhancedCount: filtered.enhanced.length,
    dimensionalCount: filtered.dimensional.length,
    allMatchedCount: allRequirements.length,
    filteredMatchedCount: filterScopedRequirements.length,
    totalCount: dbRequirements.length,
    uniqueRequirementsAll: allRequirements,
    visibleRequirements,
    phaseGroups,
    restorableRequirementsByCategory,
    matchedRequirementIds: new Set(allRequirements.map(item => item.id)),
    defaultVisibleIds,
    hasSelection,
  };
}

export function getPhaseColors(phase: string) {
  return PHASE_COLORS[phase] || PHASE_COLORS['战略规划与资源准备'];
}
