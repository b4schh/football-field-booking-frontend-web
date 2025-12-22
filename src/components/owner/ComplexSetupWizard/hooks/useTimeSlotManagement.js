import { useState } from 'react';

export const useTimeSlotManagement = (fieldsData, setFieldsData) => {
  const [timeSlotForms, setTimeSlotForms] = useState({});
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [editingSlotData, setEditingSlotData] = useState(null);

  const isTimeSlotOverlapping = (fieldTempId, newStartTime, newEndTime, excludeSlotTempId = null) => {
    const field = fieldsData.find((f) => f.tempId === fieldTempId);
    if (!field || field.timeSlots.length === 0) return false;

    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStart = toMinutes(newStartTime);
    const newEnd = toMinutes(newEndTime);

    return field.timeSlots.some((slot) => {
      if (excludeSlotTempId && slot.tempId === excludeSlotTempId) return false;

      const existingStart = toMinutes(slot.startTime);
      const existingEnd = toMinutes(slot.endTime);

      return newStart < existingEnd && existingStart < newEnd;
    });
  };

  const sortTimeSlots = (slots) => {
    return [...slots].sort((a, b) => {
      const toMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  };

  const initTimeSlotForm = (fieldTempId) => {
    if (!timeSlotForms[fieldTempId]) {
      setTimeSlotForms({
        ...timeSlotForms,
        [fieldTempId]: { startTime: '06:00', endTime: '08:00', price: 200000 },
      });
    }
  };

  const updateTimeSlotForm = (fieldTempId, updates) => {
    setTimeSlotForms({
      ...timeSlotForms,
      [fieldTempId]: { ...timeSlotForms[fieldTempId], ...updates },
    });
  };

  const addTimeSlot = (fieldTempId) => {
    const form = timeSlotForms[fieldTempId];
    if (!form || !form.startTime || !form.endTime || !form.price) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (form.startTime >= form.endTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    if (isTimeSlotOverlapping(fieldTempId, form.startTime, form.endTime)) {
      alert('Khung giờ này bị trùng với khung giờ đã có. Vui lòng chọn khung giờ khác.');
      return;
    }

    const newSlot = {
      tempId: Date.now(),
      startTime: form.startTime,
      endTime: form.endTime,
      price: parseFloat(form.price),
    };

    setFieldsData(
      fieldsData.map((f) => {
        if (f.tempId === fieldTempId) {
          const updatedSlots = sortTimeSlots([...f.timeSlots, newSlot]);
          return { ...f, timeSlots: updatedSlots };
        }
        return f;
      })
    );

    // Auto-set next time slot
    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const toTimeString = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const nextStartMinutes = toMinutes(form.endTime);
    const nextEndMinutes = nextStartMinutes + 90;

    setTimeSlotForms({
      ...timeSlotForms,
      [fieldTempId]: {
        startTime: toTimeString(nextStartMinutes),
        endTime: toTimeString(nextEndMinutes),
        price: form.price,
      },
    });
  };

  const removeTimeSlot = (fieldTempId, slotTempId) => {
    setFieldsData(
      fieldsData.map((f) =>
        f.tempId === fieldTempId
          ? { ...f, timeSlots: f.timeSlots.filter((ts) => ts.tempId !== slotTempId) }
          : f
      )
    );
  };

  const startEditTimeSlot = (fieldTempId, slot) => {
    setEditingTimeSlot({ fieldTempId, slotTempId: slot.tempId });
    setEditingSlotData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
    });
  };

  const cancelEditTimeSlot = () => {
    setEditingTimeSlot(null);
    setEditingSlotData(null);
  };

  const saveEditTimeSlot = () => {
    if (!editingTimeSlot || !editingSlotData) return;

    const { fieldTempId, slotTempId } = editingTimeSlot;

    if (!editingSlotData.startTime || !editingSlotData.endTime || !editingSlotData.price) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editingSlotData.startTime >= editingSlotData.endTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    if (
      isTimeSlotOverlapping(
        fieldTempId,
        editingSlotData.startTime,
        editingSlotData.endTime,
        slotTempId
      )
    ) {
      alert('Khung giờ này bị trùng với khung giờ khác. Vui lòng chọn khung giờ khác.');
      return;
    }

    setFieldsData(
      fieldsData.map((f) => {
        if (f.tempId === fieldTempId) {
          const updatedSlots = f.timeSlots.map((slot) =>
            slot.tempId === slotTempId
              ? { ...slot, ...editingSlotData, price: parseFloat(editingSlotData.price) }
              : slot
          );
          return { ...f, timeSlots: sortTimeSlots(updatedSlots) };
        }
        return f;
      })
    );

    cancelEditTimeSlot();
  };

  const applyTimeSlotsToAll = (sourceFieldTempId) => {
    const sourceField = fieldsData.find((f) => f.tempId === sourceFieldTempId);
    if (!sourceField || sourceField.timeSlots.length === 0) {
      alert('Sân này chưa có khung giờ');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn áp dụng ${sourceField.timeSlots.length} khung giờ của "${sourceField.name}" cho ${fieldsData.length - 1} sân còn lại?`
    );

    if (confirmed) {
      setFieldsData(
        fieldsData.map((f) => {
          if (f.tempId === sourceFieldTempId) return f;

          const copiedSlots = sourceField.timeSlots.map((slot, index) => ({
            ...slot,
            tempId: Date.now() + Math.random() + index,
          }));

          return { ...f, timeSlots: [...copiedSlots] };
        })
      );
    }
  };

  return {
    timeSlotForms,
    editingTimeSlot,
    editingSlotData,
    setEditingSlotData,
    initTimeSlotForm,
    updateTimeSlotForm,
    addTimeSlot,
    removeTimeSlot,
    startEditTimeSlot,
    cancelEditTimeSlot,
    saveEditTimeSlot,
    applyTimeSlotsToAll,
    sortTimeSlots,
  };
};
