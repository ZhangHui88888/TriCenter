export type FunnelStage = 
  | 'POTENTIAL' 
  | 'NO_DEMAND' 
  | 'NO_INTENTION' 
  | 'HAS_DEMAND' 
  | 'SIGNED' 
  | 'SETTLED' 
  | 'INCUBATING';

export interface FunnelStageInfo {
  code: FunnelStage;
  name: string;
  color: string;
  count: number;
}

export interface Contact {
  id?: number;
  name: string;
  phone: string;
  position?: string;
  department?: string;
  is_primary: boolean;
  wechat?: string;
  email?: string;
  remark?: string;
}

export interface Enterprise {
  id: number;
  enterprise_name: string;
  unified_credit_code?: string;
  province?: string;
  city?: string;
  district: string;
  detailed_address?: string;
  established_date?: string;
  enterprise_type: string;
  industry: string;
  employee_scale?: string;
  domestic_revenue?: string;
  crossborder_revenue?: string;
  website?: string;
  online_platform?: string;
  funnel_stage: FunnelStage;
  source?: string;
  remark?: string;
  created_at: string;
  updated_at?: string;
  contacts: Contact[];
  has_crossborder?: boolean;
  main_platforms?: string;
  target_markets?: string;
  transformation_willingness?: string;
  is_cooperating?: boolean;
  last_year_revenue?: number;
  year_before_last_revenue?: number;
}

export interface FollowUpRecord {
  id: number;
  enterprise_id: number;
  enterprise_name: string;
  follow_up_date: string;
  follow_up_person: string;
  follow_up_type: string;
  content: string;
  overall_status?: string;
  next_step?: string;
  stage_before?: FunnelStage;
  stage_after?: FunnelStage;
  created_at?: string;
}

export interface ConversionData {
  from: string;
  to: string;
  count: number;
  rate: number;
}

export interface DistrictStat {
  name: string;
  count: number;
}

export interface IndustryStat {
  name: string;
  count: number;
}

export interface TrendData {
  month: string;
  potential: number;
  hasDemand: number;
  signed: number;
  settled: number;
}

export interface DashboardStats {
  totalEnterprises: number;
  potentialCount: number;
  hasDemandCount: number;
  signedSettledCount: number;
  monthlyChange: {
    total: number;
    potential: number;
    hasDemand: number;
    signedSettled: number;
  };
}

export interface FollowUpStats {
  monthlyCount: number;
  weeklyCount: number;
  dailyCount: number;
  pendingCount: number;
}

export interface EnterpriseFormData {
  enterprise_name: string;
  unified_credit_code?: string;
  province?: string;
  city?: string;
  district: string;
  detailed_address?: string;
  enterprise_type: string;
  industry: string;
  employee_scale?: string;
  domestic_revenue?: string;
  crossborder_revenue?: string;
  website?: string;
  online_platform?: string;
  source?: string;
  remark?: string;
  contact_name: string;
  contact_phone: string;
  contact_position?: string;
  has_crossborder?: boolean;
  main_platforms?: string[];
  transformation_willingness?: string;
}

export interface FollowUpFormData {
  enterprise_id: number;
  follow_up_type: string;
  follow_up_date: string;
  content: string;
  overall_status?: string;
  next_step?: string;
  stage_after?: FunnelStage;
}

// 产品信息
export interface ProductInfo {
  id: number;
  name: string;
  categoryId?: number;
  categoryName?: string;
  certificationIds?: number[];
  certificationNames?: string[];
  targetRegionIds?: number[];
  targetRegionNames?: string[];
  targetCountryIds?: string[];
  annualSales?: string;
  localProcurementRatio?: string;
  automationLevelId?: number;
  automationLevelName?: string;
  annualCapacity?: string;
  logisticsPartnerIds?: number[];
  logisticsPartnerNames?: string[];
}

// 专利信息
export interface PatentInfo {
  id: number;
  name: string;
  patentNo?: string;
}

// 企业详情（包含产品和专利）
export interface EnterpriseDetail extends Enterprise {
  products?: ProductInfo[];
  patents?: PatentInfo[];
  hasOwnBrand?: boolean;
  brandNames?: string[];
}
