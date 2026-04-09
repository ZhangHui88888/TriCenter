import type { RequirementConfigData } from '@/services/api';

export type RequirementRecord = RequirementConfigData['requirements'][number];

export type RequirementStatFilterKey = 'all' | 'universal' | 'enhanced' | 'dimensional';

export type RequirementDisplayMode = 'default' | 'template' | 'dimension' | 'all';

export interface RequirementStatItem {
  key: RequirementStatFilterKey;
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
}

export interface EnterpriseCustomRequirement {
  id: string;
  name: string;
  description: string;
  detailDescription?: string;
  phase: string;
  category: string;
  sourceRequirementId?: string;
}

export interface RequirementDisplayItem extends RequirementRecord {
  sources: string[];
}

export interface RequirementCategoryGroup {
  key: string;
  phase: string;
  category: string;
  items: RequirementDisplayItem[];
  removedCount: number;
  restorableItems: RequirementRecord[];
}

export interface RequirementPhaseGroup {
  key: string;
  phase: string;
  count: number;
  removedCount: number;
  removedIds: string[];
  categories: RequirementCategoryGroup[];
}

export interface RequirementViewData {
  filteredUniversalCount: number;
  filteredEnhancedCount: number;
  dimensionalCount: number;
  allMatchedCount: number;
  filteredMatchedCount: number;
  totalCount: number;
  uniqueRequirementsAll: RequirementRecord[];
  visibleRequirements: RequirementRecord[];
  phaseGroups: RequirementPhaseGroup[];
  restorableRequirementsByCategory: Record<string, RequirementRecord[]>;
  matchedRequirementIds: Set<string>;
  defaultVisibleIds: Set<string>;
  hasSelection: boolean;
}
