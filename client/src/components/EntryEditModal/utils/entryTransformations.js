import { sanitizeHexValue } from './entryValidation.js';

export const transformShiftKeys = (entries, moveBy) => {
  return entries.map(entry => {
    const keyParts = entry.key.split('.');
    const currentKeyNum = parseInt(keyParts[1], 10);
    const newKeyNum = Math.max(0, Math.min(9999, currentKeyNum + moveBy));
    
    return {
      ...entry,
      key: `${keyParts[0]}.${newKeyNum.toString().padStart(4, '0')}`
    };
  });
};

export const transformShiftValues = (entries, moveBy) => {
  return entries.map(entry => {
    const currentValue = parseInt(entry.value, 16);
    const newValueNum = Math.max(0, Math.min(0xFFFFFFFF, currentValue + moveBy));
    
    return {
      ...entry,
      value: newValueNum.toString(16).toLowerCase().padStart(8, '0')
    };
  });
};

export const transformNumberValues = (entries, startValue, countBy) => {
  return entries.map((entry, index) => {
    const sequentialValue = startValue + (index * countBy);
    const clampedValue = Math.max(0, Math.min(0xFFFFFFFF, sequentialValue));
    
    return {
      ...entry,
      value: clampedValue.toString(16).toLowerCase().padStart(8, '0')
    };
  });
};

export const transformSetSameValue = (entries, hexValue) => {
  const sanitizedValue = sanitizeHexValue(hexValue);
  
  return entries.map(entry => ({
    ...entry,
    value: sanitizedValue
  }));
};

export const applyTransformation = (entries, transformType, params) => {
  switch (transformType) {
    case 'shift_keys':
      return transformShiftKeys(entries, params.moveBy);
      
    case 'shift_values':
      return transformShiftValues(entries, params.moveBy);
      
    case 'number_values':
      return transformNumberValues(entries, params.startValue, params.countBy);
      
    case 'set_same_value':
      return transformSetSameValue(entries, params.hexValue);
      
    default:
      return entries;
  }
};

export const generateTransformPreview = (entries, transformType, params) => {
  const transformedEntries = applyTransformation(entries, transformType, params);
  
  return entries.map((originalEntry, index) => ({
    oldKey: originalEntry.key,
    oldValue: originalEntry.value,
    newKey: transformedEntries[index].key,
    newValue: transformedEntries[index].value,
    hasKeyChange: originalEntry.key !== transformedEntries[index].key,
    hasValueChange: originalEntry.value !== transformedEntries[index].value,
  }));
};

export const detectTransformConflicts = (preview, allEntries, selectedKeys) => {
  const conflicts = [];
  const existingKeys = new Set(
    allEntries
      .filter(entry => !selectedKeys.has(entry.key))
      .map(entry => entry.key)
  );
  
  preview.forEach((previewItem, index) => {
    if (previewItem.hasKeyChange && existingKeys.has(previewItem.newKey)) {
      conflicts.push({
        index,
        oldKey: previewItem.oldKey,
        newKey: previewItem.newKey,
        message: `Key conflict: ${previewItem.newKey} already exists`
      });
    }
  });
  
  // Check for conflicts within the transformation itself
  const newKeys = new Map();
  preview.forEach((previewItem, index) => {
    if (newKeys.has(previewItem.newKey)) {
      conflicts.push({
        index,
        oldKey: previewItem.oldKey,
        newKey: previewItem.newKey,
        message: `Duplicate key in transformation: ${previewItem.newKey}`,
        duplicateIndex: newKeys.get(previewItem.newKey)
      });
    } else {
      newKeys.set(previewItem.newKey, index);
    }
  });
  
  return conflicts;
};