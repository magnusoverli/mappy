import { validateEntryKey, validateHexValue } from '../../../utils/validationUtils.js';

export const validateEntry = (entry) => {
  const errors = [];
  
  if (!validateEntryKey(entry.key)) {
    errors.push({
      field: 'key',
      message: 'Invalid key format (expected: XX.XXXX)',
      severity: 'error'
    });
  }
  
  if (!validateHexValue(entry.value)) {
    errors.push({
      field: 'value', 
      message: 'Invalid hex value (expected: 8 hex digits)',
      severity: 'error'
    });
  }
  
  if (typeof entry.offset !== 'number') {
    errors.push({
      field: 'offset',
      message: 'Offset must be a number',
      severity: 'error'
    });
  }
  
  return errors;
};

export const validateEntryBatch = (entries) => {
  const allErrors = [];
  const keyMap = new Map();
  
  entries.forEach((entry, index) => {
    // Individual entry validation
    const entryErrors = validateEntry(entry);
    entryErrors.forEach(error => {
      allErrors.push({
        ...error,
        entryIndex: index,
        entryKey: entry.key
      });
    });
    
    // Duplicate key detection
    if (keyMap.has(entry.key)) {
      allErrors.push({
        field: 'key',
        message: `Duplicate key: ${entry.key}`,
        severity: 'error',
        entryIndex: index,
        entryKey: entry.key,
        duplicateIndex: keyMap.get(entry.key)
      });
    } else {
      keyMap.set(entry.key, index);
    }
  });
  
  return allErrors;
};

export const validateKeyRange = (key, min = 0, max = 9999) => {
  const parts = key.split('.');
  if (parts.length !== 2) return false;
  
  const keyNum = parseInt(parts[1], 10);
  return !isNaN(keyNum) && keyNum >= min && keyNum <= max;
};

export const validateHexRange = (value, min = 0x00000000, max = 0xFFFFFFFF) => {
  if (!validateHexValue(value)) return false;
  
  const numValue = parseInt(value, 16);
  return numValue >= min && numValue <= max;
};

export const detectKeyConflicts = (newEntries, existingEntries) => {
  const existingKeys = new Set(existingEntries.map(e => e.key));
  const conflicts = [];
  
  newEntries.forEach((entry, index) => {
    if (existingKeys.has(entry.key)) {
      conflicts.push({
        entryIndex: index,
        key: entry.key,
        message: `Key ${entry.key} already exists`
      });
    }
  });
  
  return conflicts;
};

export const validateQuantityLimits = (quantity, max = 1000) => {
  if (quantity < 1) {
    return { valid: false, message: 'Quantity must be at least 1' };
  }
  
  if (quantity > max) {
    return { valid: false, message: `Quantity cannot exceed ${max}` };
  }
  
  return { valid: true };
};

export const sanitizeHexValue = (value) => {
  return value
    .replace(/[^0-9A-Fa-f]/g, '')
    .slice(0, 8)
    .toLowerCase()
    .padStart(8, '0');
};

export const sanitizeKeyValue = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 4)
    .padStart(4, '0');
};