import { create } from "zustand";

const useBookingDraftStore = create((set) => ({
  // Lưu trữ thông tin booking đang chọn (draft)
  selectedSlot: null,
  selectedField: null,
  selectedDate: null,
  complexInfo: null,

  // Set booking draft
  setBookingDraft: (field, slot, date, complex) => {
    set({
      selectedField: field,
      selectedSlot: slot,
      selectedDate: date,
      complexInfo: complex
    });
  },

  // Clear booking draft
  clearBookingDraft: () => {
    set({
      selectedSlot: null,
      selectedField: null,
      selectedDate: null,
      complexInfo: null
    });
  },

  // Check if has draft
  hasDraft: () => {
    const state = useBookingDraftStore.getState();
    return !!(state.selectedSlot && state.selectedField && state.selectedDate);
  }
}));

export default useBookingDraftStore;
