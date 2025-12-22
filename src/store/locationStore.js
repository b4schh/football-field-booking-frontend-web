import { create } from "zustand";
import locationService from "../services/locationService";

/**
 * Location Store
 * Cache provinces and wards to avoid multiple API calls
 */
const useLocationStore = create((set, get) => ({
  // State
  provinces: [],
  wardsCache: {}, // { provinceCode: [...wards] }
  isLoadingProvinces: false,
  isLoadingWards: false,

  // Actions
  fetchProvinces: async () => {
    const state = get();
    
    // If already loaded or loading, skip
    if (state.provinces.length > 0 || state.isLoadingProvinces) {
      return state.provinces;
    }

    set({ isLoadingProvinces: true });

    try {
      const provinces = await locationService.getProvinces();
      
      // Transform to options format
      const provinceOptions = provinces.map(p => ({
        value: p.name,
        label: p.name,
        code: p.code,
        codename: p.codename,
      }));

      set({ 
        provinces: provinceOptions,
        isLoadingProvinces: false 
      });

      return provinceOptions;
    } catch (error) {
      console.error("Error loading provinces:", error);
      set({ isLoadingProvinces: false });
      return [];
    }
  },

  fetchWardsByProvince: async (provinceCode) => {
    const state = get();

    // Check cache first
    if (state.wardsCache[provinceCode]) {
      return state.wardsCache[provinceCode];
    }

    set({ isLoadingWards: true });

    try {
      const wards = await locationService.getWardsByProvince(provinceCode);
      
      // Transform to options format
      const wardOptions = wards.map(w => ({
        value: w.name,
        label: w.name,
        code: w.code,
        codename: w.codename,
      }));

      // Cache the result
      set({ 
        wardsCache: {
          ...state.wardsCache,
          [provinceCode]: wardOptions
        },
        isLoadingWards: false 
      });

      return wardOptions;
    } catch (error) {
      console.error("Error loading wards:", error);
      set({ isLoadingWards: false });
      return [];
    }
  },

  getProvinceByName: (provinceName) => {
    const state = get();
    return state.provinces.find(p => p.value === provinceName);
  },

  // Clear cache if needed
  clearCache: () => {
    set({ wardsCache: {} });
  },
}));

export default useLocationStore;
