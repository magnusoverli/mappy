export const VALIDATION_PATTERNS = {
  ENTRY_KEY: /^\d{2}\.\d{4}$/,
  HEX_VALUE: /^[0-9A-Fa-f]{8}$/,
  LAYER_KEY: /^\d{2}$/,
  HEX_VALUE_PARTIAL: /^([0-9A-Fa-f]{8})?$/,
};

export const validateEntryKey = (key) => VALIDATION_PATTERNS.ENTRY_KEY.test(key);
export const validateHexValue = (value) => VALIDATION_PATTERNS.HEX_VALUE.test(value);
export const validateLayerKey = (key) => VALIDATION_PATTERNS.LAYER_KEY.test(key);
export const validatePartialHexValue = (value) => VALIDATION_PATTERNS.HEX_VALUE_PARTIAL.test(value);

export const isValidEntry = (entry) => 
  validateEntryKey(entry.key) && validateHexValue(entry.value);

export const getValidationError = (entry) => {
  if (!validateEntryKey(entry.key)) {
    return { field: 'key', message: 'Invalid key format (expected: XX.XXXX)' };
  }
  if (!validateHexValue(entry.value)) {
    return { field: 'value', message: 'Invalid hex value (expected: 8 hex digits)' };
  }
  return null;
};