import { create } from 'zustand';
import { buildDefinitionExpression } from '../utils/query-builder.js';
import type { MineStatuGroup } from '../config/mine-statu-groups.js';
import type Geometry from '@arcgis/core/geometry/Geometry.js';

export type ViewState = 'statewide' | 'county' | 'mine-detail';

export interface CountyFeature {
  name: string;
  geometry: Geometry;
  attributes: Record<string, unknown>;
}

export interface MineFeature {
  permitNo: string;
  attributes: Record<string, unknown>;
  geometry: Geometry;
}

interface DashboardState {
  viewState: ViewState;
  selectedCounty: CountyFeature | null;
  selectedMine: MineFeature | null;

  typeFlag: string | null;
  featCLS: string | null;
  mineStatuGroup: MineStatuGroup | null;
  searchQuery: string;

  definitionExpression: string;

  selectCounty: (county: CountyFeature) => void;
  clearCounty: () => void;
  setTypeFlag: (flag: string | null) => void;
  setFeatCLS: (cls: string | null) => void;
  setTypeFlagAndFeatCLS: (flag: string | null, cls: string | null) => void;
  setMineStatuGroup: (group: MineStatuGroup | null) => void;
  selectMine: (mine: MineFeature) => void;
  clearMine: () => void;
  resetAllFilters: () => void;
  setSearchQuery: (query: string) => void;
}

function computeExpression(state: {
  typeFlag: string | null;
  featCLS: string | null;
  mineStatuGroup: MineStatuGroup | null;
}): string {
  return buildDefinitionExpression(state);
}

const initialFilters = { typeFlag: null, featCLS: null, mineStatuGroup: null };

export const useDashboardStore = create<DashboardState>((set) => ({
  viewState: 'statewide',
  selectedCounty: null,
  selectedMine: null,
  typeFlag: null,
  featCLS: null,
  mineStatuGroup: null,
  searchQuery: '',
  definitionExpression: computeExpression(initialFilters),

  selectCounty: (county) =>
    set((state) => ({
      viewState: 'county',
      selectedCounty: county,
      selectedMine: null,
      definitionExpression: computeExpression(state),
    })),

  clearCounty: () =>
    set((state) => ({
      viewState: 'statewide',
      selectedCounty: null,
      selectedMine: null,
      definitionExpression: computeExpression(state),
    })),

  setTypeFlag: (flag) =>
    set((state) => {
      const next = { ...state, typeFlag: state.typeFlag === flag ? null : flag };
      return {
        typeFlag: next.typeFlag,
        definitionExpression: computeExpression(next),
      };
    }),

  setFeatCLS: (cls) =>
    set((state) => {
      const next = { ...state, featCLS: state.featCLS === cls ? null : cls };
      return {
        featCLS: next.featCLS,
        definitionExpression: computeExpression(next),
      };
    }),

  setTypeFlagAndFeatCLS: (flag, cls) =>
    set((state) => {
      const sameCard = state.typeFlag === flag && state.featCLS === cls;
      const nextTypeFlag = sameCard ? null : flag;
      const nextFeatCLS = sameCard ? null : cls;
      const next = { ...state, typeFlag: nextTypeFlag, featCLS: nextFeatCLS };
      return {
        typeFlag: nextTypeFlag,
        featCLS: nextFeatCLS,
        definitionExpression: computeExpression(next),
      };
    }),

  setMineStatuGroup: (group) =>
    set((state) => {
      const next = {
        ...state,
        mineStatuGroup: state.mineStatuGroup === group ? null : group,
      };
      return {
        mineStatuGroup: next.mineStatuGroup,
        definitionExpression: computeExpression(next),
      };
    }),

  selectMine: (mine) =>
    set({ viewState: 'mine-detail', selectedMine: mine }),

  clearMine: () =>
    set((state) => ({
      viewState: state.selectedCounty ? 'county' : 'statewide',
      selectedMine: null,
    })),

  resetAllFilters: () =>
    set({
      typeFlag: null,
      featCLS: null,
      mineStatuGroup: null,
      searchQuery: '',
      definitionExpression: computeExpression(initialFilters),
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
