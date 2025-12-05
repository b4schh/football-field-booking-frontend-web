import api from "./api";

/**
 * Location Service
 * Handles all location-related API calls (Provinces & Wards)
 */

const locationService = {
  /**
   * Get all provinces
   * @returns {Promise} Response with list of provinces
   */
  getProvinces: async () => {
    try {
      const response = await api.get("/locations/provinces");
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  /**
   * Get wards by province code
   * @param {number} provinceCode - The code of the province
   * @returns {Promise} Response with list of wards
   */
  getWardsByProvince: async (provinceCode) => {
    try {
      const response = await api.get(`/locations/provinces/${provinceCode}/wards`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wards for province ${provinceCode}:`, error);
      throw error;
    }
  },

  /**
   * Get all wards (optional - if needed)
   * @returns {Promise} Response with list of all wards
   */
  getAllWards: async () => {
    try {
      const response = await api.get("/locations/wards");
      return response.data;
    } catch (error) {
      console.error("Error fetching all wards:", error);
      throw error;
    }
  },
};

export default locationService;
