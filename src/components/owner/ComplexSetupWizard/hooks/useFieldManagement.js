import { useState } from 'react';

export const useFieldManagement = () => {
  const [fieldsData, setFieldsData] = useState([
    {
      tempId: Date.now(),
      name: 'Sân 1',
      fieldType: 'Sân 5 người',
      description: '',
      timeSlots: [],
    },
  ]);

  const addField = () => {
    const newField = {
      tempId: Date.now(),
      name: `Sân ${fieldsData.length + 1}`,
      fieldType: 'Sân 5 người',
      description: '',
      timeSlots: [],
    };
    setFieldsData([...fieldsData, newField]);
  };

  const removeField = (tempId) => {
    if (fieldsData.length === 1) {
      alert('Phải có ít nhất 1 sân');
      return;
    }
    setFieldsData(fieldsData.filter((f) => f.tempId !== tempId));
  };

  const updateField = (tempId, updates) => {
    setFieldsData(fieldsData.map((f) => (f.tempId === tempId ? { ...f, ...updates } : f)));
  };

  const handleQuickAdd = (config) => {
    const startIndex = fieldsData.length + 1;
    const newFields = [];

    for (let i = 0; i < config.count; i++) {
      const fieldNumber = startIndex + i;
      const name = config.namePattern.replace('{number}', fieldNumber);
      newFields.push({
        tempId: Date.now() + i,
        name,
        fieldType: config.fieldType,
        description: '',
        timeSlots: [],
      });
    }

    setFieldsData([...fieldsData, ...newFields]);
  };

  const getDuplicateFieldNames = () => {
    const names = fieldsData.map((f) => f.name.trim().toLowerCase());
    const duplicates = names.filter((name, index) => name && names.indexOf(name) !== index);
    return [...new Set(duplicates)];
  };

  const hasDuplicateFieldNames = () => {
    return getDuplicateFieldNames().length > 0;
  };

  const isFieldNameDuplicate = (fieldName) => {
    const trimmedName = fieldName.trim().toLowerCase();
    if (!trimmedName) return false;
    return fieldsData.filter((f) => f.name.trim().toLowerCase() === trimmedName).length > 1;
  };

  return {
    fieldsData,
    setFieldsData,
    addField,
    removeField,
    updateField,
    handleQuickAdd,
    getDuplicateFieldNames,
    hasDuplicateFieldNames,
    isFieldNameDuplicate,
  };
};
