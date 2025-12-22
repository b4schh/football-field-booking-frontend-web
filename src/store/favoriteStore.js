import { create } from "zustand";
import { favoriteService } from "../services/favoriteService";

const useFavoriteStore = create((set, get) => ({
  // State
  favorites: [],
  favoriteIds: new Set(), // For quick lookup
  isLoading: false,
  error: null,

  // Actions
  fetchMyFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await favoriteService.getMyFavorites();
      const favoriteIds = new Set(favorites.map(c => c.id));
      
      set({ 
        favorites,
        favoriteIds,
        isLoading: false 
      });
      
      return { success: true, data: favorites };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách yêu thích";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  isFavorite: (complexId) => {
    return get().favoriteIds.has(complexId);
  },

  toggleFavorite: async (complexId) => {
    try {
      const result = await favoriteService.toggleFavorite(complexId);
      
      // Update local state
      const { favorites, favoriteIds } = get();
      
      if (result.isFavorite) {
        // Added to favorites - need to fetch full complex data or just add ID
        favoriteIds.add(complexId);
      } else {
        // Removed from favorites
        favoriteIds.delete(complexId);
        const updatedFavorites = favorites.filter(c => c.id !== complexId);
        set({ favorites: updatedFavorites });
      }
      
      set({ favoriteIds: new Set(favoriteIds) });
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể thay đổi trạng thái yêu thích";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useFavoriteStore;
