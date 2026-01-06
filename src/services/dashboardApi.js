import api from "./api";

// ==================== USERS API ====================
export const usersApi = {
  // Get all users with pagination
  getUsers: (params = {}) => {
    return api.get("/users", { params });
  },

  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Update user
  updateUser: (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  // Delete user
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

// ==================== COMPLEXES API ====================
export const complexesApi = {
  // Get all complexes (public + filters)
  getComplexes: (params = {}) => {
    return api.get("/complexes", { params });
  },

  // Get complex by ID
  getComplexById: (id) => {
    return api.get(`/complexes/${id}`);
  },

  // Owner: Get my complexes
  getMyComplexes: () => {
    return api.get("/complexes/owner/my-complexes");
  },

  // Admin: Get complexes by owner ID
  getComplexesByOwnerId: (ownerId) => {
    return api.get(`/complexes/admin/owner/${ownerId}`);
  },

  // Owner: Create complex
  createComplexAsOwner: (data) => {
    return api.post("/complexes/owner", data);
  },

  // Admin: Create complex
  createComplexAsAdmin: (data) => {
    return api.post("/complexes/admin", data);
  },

  // Update complex
  updateComplex: (id, data) => {
    return api.put(`/complexes/${id}`, data);
  },

  // Delete complex
  deleteComplex: (id) => {
    return api.delete(`/complexes/${id}`);
  },
};

// ==================== FIELDS API ====================
export const fieldsApi = {
  // Get all fields
  getFields: (params = {}) => {
    return api.get("/fields", { params });
  },

  // Get field by ID
  getFieldById: (id) => {
    return api.get(`/fields/${id}`);
  },

  // Get fields by complex ID
  getFieldsByComplexId: (complexId) => {
    return api.get(`/fields/complex/${complexId}`);
  },

  // Create field
  createField: (data) => {
    return api.post("/fields", data);
  },

  // Update field
  updateField: (id, data) => {
    return api.put(`/fields/${id}`, data);
  },

  // Delete field
  deleteField: (id) => {
    return api.delete(`/fields/${id}`);
  },
};

// ==================== TIME SLOTS API ====================
export const timeSlotsApi = {
  // Get all time slots
  getTimeSlots: () => {
    return api.get("/timeslots");
  },

  // Get time slot by ID
  getTimeSlotById: (id) => {
    return api.get(`/timeslots/${id}`);
  },

  // Get time slots by field ID
  getTimeSlotsByFieldId: (fieldId) => {
    return api.get(`/timeslots/field/${fieldId}`);
  },

  // Create time slot
  createTimeSlot: (data) => {
    return api.post("/timeslots", data);
  },

  // Update time slot
  updateTimeSlot: (id, data) => {
    return api.put(`/timeslots/${id}`, data);
  },

  // Delete time slot
  deleteTimeSlot: (id) => {
    return api.delete(`/timeslots/${id}`);
  },
};

// ==================== BOOKINGS API ====================
export const bookingsApi = {
  // Get all bookings (admin)
  getBookings: (params = {}) => {
    return api.get("/bookings", { params });
  },

  // Get booking by ID
  getBookingById: (id) => {
    return api.get(`/bookings/${id}`);
  },

  // Get my bookings (customer)
  getMyBookings: () => {
    return api.get("/bookings/customer/my-bookings");
  },

  // Get bookings by complex (owner)
  getBookingsByComplex: (complexId, params = {}) => {
    return api.get(`/bookings/owner/complex/${complexId}`, { params });
  },

  // Owner: Get all my bookings
  getOwnerBookings: () => {
    return api.get("/bookings/owner-bookings");
  },

  // Create booking
  createBooking: (data) => {
    return api.post("/bookings", data);
  },

  // Upload payment proof
  uploadPaymentProof: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/bookings/${id}/upload-payment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Approve booking
  approveBooking: (id) => {
    return api.post(`/bookings/${id}/approve`);
  },

  // Reject booking
  rejectBooking: (id, reason) => {
    return api.post(`/bookings/${id}/reject`, { reason });
  },

  // Cancel booking
  cancelBooking: (id, reason) => {
    return api.post(`/bookings/${id}/cancel`, { reason });
  },

  // Complete booking
  completeBooking: (id) => {
    return api.post(`/bookings/${id}/complete`);
  },

  // Mark no show
  markNoShow: (id) => {
    return api.post(`/bookings/${id}/no-show`);
  },
};

// ==================== COMPLEX IMAGES API ====================
export const complexImagesApi = {
  // Upload image
  uploadImage: (complexId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/complex-images/${complexId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get images by complex ID
  getImagesByComplexId: (complexId) => {
    return api.get(`/complex-images/${complexId}`);
  },

  // Set main image
  setMainImage: (complexId, imageId) => {
    return api.put(`/complex-images/${complexId}/main/${imageId}`);
  },

  // Delete image
  deleteImage: (imageId) => {
    return api.delete(`/complex-images/${imageId}`);
  },
};

// ==================== OWNER STATISTICS API ====================
export const ownerStatisticsApi = {
  // Get dashboard statistics
  getDashboardStats: () => {
    return api.get("/statistics/owner/dashboard");
  },

  // Get revenue chart data
  getRevenueChart: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get("/statistics/owner/revenue", { params });
  },

  // Get top fields
  getTopFields: (limit = 5) => {
    return api.get("/statistics/owner/top-fields", { params: { limit } });
  },

  // Get peak hours
  getPeakHours: () => {
    return api.get("/statistics/owner/peak-hours");
  },

  // Get upcoming bookings
  getUpcomingBookings: (hoursAhead = 3) => {
    return api.get("/statistics/owner/upcoming", { params: { hoursAhead } });
  },

  // Get revenue summary by period
  // periodType: 0=Daily, 1=Weekly, 2=Monthly, 3=Quarterly, 4=Yearly
  getRevenueSummary: (periodType, startDate, endDate) => {
    const params = { periodType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get("/statistics/owner/revenue-summary", { params });
  },

  // Get revenue comparison
  getRevenueComparison: (periodType, startDate, endDate) => {
    const params = { periodType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get("/statistics/owner/revenue-comparison", { params });
  },
};

// Export all APIs
const dashboardApi = {
  users: usersApi,
  complexes: complexesApi,
  fields: fieldsApi,
  timeSlots: timeSlotsApi,
  bookings: bookingsApi,
  complexImages: complexImagesApi,
  ownerStatistics: ownerStatisticsApi,
};

export default dashboardApi;
