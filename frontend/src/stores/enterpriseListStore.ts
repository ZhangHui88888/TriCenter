import { create } from 'zustand';

interface EnterpriseListFilterState {
  searchTerm: string;
  stageFilter: string;
  districtFilter: string;
  industryFilter: (string | number)[] | undefined;
  advancedFilters: Record<string, any>;
  page: number;
  pageSize: number;

  setSearchTerm: (v: string) => void;
  setStageFilter: (v: string) => void;
  setDistrictFilter: (v: string) => void;
  setIndustryFilter: (v: (string | number)[] | undefined) => void;
  setAdvancedFilters: (v: Record<string, any>) => void;
  setPage: (v: number) => void;
  setPageSize: (v: number) => void;
  resetFilters: () => void;
}

const initialState = {
  searchTerm: '',
  stageFilter: '',
  districtFilter: '',
  industryFilter: undefined as (string | number)[] | undefined,
  advancedFilters: {} as Record<string, any>,
  page: 1,
  pageSize: 5,
};

export const useEnterpriseListStore = create<EnterpriseListFilterState>()((set) => ({
  ...initialState,

  setSearchTerm: (v) => set({ searchTerm: v }),
  setStageFilter: (v) => set({ stageFilter: v }),
  setDistrictFilter: (v) => set({ districtFilter: v }),
  setIndustryFilter: (v) => set({ industryFilter: v }),
  setAdvancedFilters: (v) => set({ advancedFilters: v }),
  setPage: (v) => set({ page: v }),
  setPageSize: (v) => set({ pageSize: v }),
  resetFilters: () => set(initialState),
}));
