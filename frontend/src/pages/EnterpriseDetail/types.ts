import type { Enterprise, FollowUpRecord } from '@/types';

export interface EnterpriseDetailProps {
  enterprise: Enterprise;
  stageInfo: { name: string; color: string };
}

export interface TabComponentProps extends EnterpriseDetailProps {
  onEdit?: (section: string) => void;
}

export interface FollowUpTabProps extends EnterpriseDetailProps {
  records: FollowUpRecord[];
  onAddFollowUp: () => void;
  onEditFollowUp: (record: any) => void;
  onDeleteFollowUp: (record: any) => void;
  getStageInfo: (code: string) => { name: string; color: string };
}

export interface ProductTabProps extends EnterpriseDetailProps {
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (name: string) => void;
  onAddPatent: () => void;
  onEditPatent: (patent: any) => void;
  onDeletePatent: (name: string) => void;
  onEditBrand: () => void;
}

export interface TradeTabProps extends EnterpriseDetailProps {
  hasForeignTrade: boolean;
  setHasForeignTrade: (value: boolean) => void;
  onEditTrade: () => void;
  marketChanges: { up: Array<{name: string; rate: string}>; down: Array<{name: string; rate: string}> };
  modeChanges: { up: Array<{name: string; rate: string}>; down: Array<{name: string; rate: string}> };
  categoryChanges: { up: Array<{name: string; rate: string}>; down: Array<{name: string; rate: string}> };
  growthReasons: string[];
  declineReasons: string[];
  onEditTradeChange: (type: 'market' | 'mode' | 'category', direction: 'up' | 'down', item?: {name: string; rate: string}) => void;
  onEditReason: (type: 'growth' | 'decline') => void;
}

export interface CrossBorderTabProps extends EnterpriseDetailProps {
  hasCrossborderEcommerce: boolean;
  setHasCrossborderEcommerce: (value: boolean) => void;
  selectedCrossborderPlatforms: string[];
  onEditPlatform: () => void;
  onEditBasic: () => void;
  onEditMarket: () => void;
  onEditNeeds: () => void;
  onEditTriCenterCoop: () => void;
  onEditPain: () => void;
}

export interface RequirementsTabProps extends EnterpriseDetailProps {
  dimensionSelections: Record<string, string[]>;
  setDimensionSelections: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  removedRequirements: string[];
  setRemovedRequirements: React.Dispatch<React.SetStateAction<string[]>>;
  customRequirements: Array<{id: string; name: string; description: string; phase: string; category: string}>;
  setCustomRequirements: React.Dispatch<React.SetStateAction<Array<{id: string; name: string; description: string; phase: string; category: string}>>>;
  onAddCustomRequirement: () => void;
}

export interface EvaluationTabProps extends EnterpriseDetailProps {
  isSurveyed: boolean;
  setIsSurveyed: (value: boolean) => void;
  isCooperating: boolean;
  setIsCooperating: (value: boolean) => void;
  onEditEvaluation: () => void;
  onEditPreliminary: () => void;
  onEditSupplement: () => void;
  onEditPolicySupport: () => void;
  onEditCompetition: () => void;
  onAddCompetitor: () => void;
  onAddRisk: () => void;
}
