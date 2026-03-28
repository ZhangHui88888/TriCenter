import type { RequirementConfigData } from '@/services/api';

export type RequirementRecord = RequirementConfigData['requirements'][number];

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
}

export interface RequirementPhaseGroup {
  key: string;
  phase: string;
  count: number;
  removedCount: number;
  categories: RequirementCategoryGroup[];
}

export interface RequirementViewData {
  filteredUniversalCount: number;
  filteredEnhancedCount: number;
  dimensionalCount: number;
  uniqueRequirementsAll: RequirementRecord[];
  visibleRequirements: RequirementRecord[];
  phaseGroups: RequirementPhaseGroup[];
  restorableRequirementsByCategory: Record<string, RequirementRecord[]>;
  matchedRequirementIds: Set<string>;
}
