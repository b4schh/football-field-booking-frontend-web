import api from "./api";

// Import local banner images
import banner1 from "../assets/img/slide-show/backdrop-bong-da-8.jpg";
import banner2 from "../assets/img/slide-show/images.jpg";
import banner3 from "../assets/img/slide-show/thiet-ke-banner-bong-da-chuyen-nghiep-soi-dong4.jpg";

/**
 * Banner Service
 * Xử lý các API calls liên quan đến banner/event slideshow
 */

export const bannerService = {
  /**
   * Lấy danh sách banner active
   * @returns {Promise} List of active banners
   */
  getActiveBanners: async () => {
    try {
      const response = await api.get("/banners/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching banners:", error);
      // Fallback to local images nếu API chưa có
      return {
        success: true,
        data: [
          {
            id: 1,
            title: "Đặt sân bóng trực tuyến",
            description: "Nhanh chóng - Tiện lợi - Uy tín",
            imageUrl: banner1,
            link: null,
            displayOrder: 1,
            isActive: true,
          },
          {
            id: 2,
            title: "Hệ thống sân bóng chuyên nghiệp",
            description: "Cơ sở vật chất hiện đại, giá cả hợp lý",
            imageUrl: banner2,
            link: null,
            displayOrder: 2,
            isActive: true,
          },
          {
            id: 3,
            title: "Trải nghiệm đặt sân tốt nhất",
            description: "Hỗ trợ 24/7 - Thanh toán linh hoạt",
            imageUrl: banner3,
            link: null,
            displayOrder: 3,
            isActive: true,
          },
        ],
      };
    }
  },

  /**
   * Admin: Lấy tất cả banners
   * @returns {Promise} List of all banners
   */
  getAllBanners: async () => {
    const response = await api.get("/admin/banners");
    return response.data;
  },

  /**
   * Admin: Tạo banner mới
   * @param {FormData} formData - Form data chứa file và thông tin banner
   * @returns {Promise} Created banner
   */
  createBanner: async (formData) => {
    const response = await api.post("/admin/banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Admin: Cập nhật banner
   * @param {number} bannerId - Banner ID
   * @param {FormData} formData - Form data
   * @returns {Promise} Updated banner
   */
  updateBanner: async (bannerId, formData) => {
    const response = await api.put(`/admin/banners/${bannerId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Admin: Xóa banner
   * @param {number} bannerId - Banner ID
   * @returns {Promise} Response
   */
  deleteBanner: async (bannerId) => {
    const response = await api.delete(`/admin/banners/${bannerId}`);
    return response.data;
  },

  /**
   * Admin: Toggle trạng thái active của banner
   * @param {number} bannerId - Banner ID
   * @returns {Promise} Response
   */
  toggleBannerStatus: async (bannerId) => {
    const response = await api.patch(`/admin/banners/${bannerId}/toggle`);
    return response.data;
  },

  /**
   * Admin: Cập nhật thứ tự hiển thị
   * @param {Array} orders - Array of {id, displayOrder}
   * @returns {Promise} Response
   */
  updateDisplayOrder: async (orders) => {
    const response = await api.put("/admin/banners/reorder", { orders });
    return response.data;
  },
};

export default bannerService;
