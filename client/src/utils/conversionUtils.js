export const formatHexValue = (value) => 
  (value >>> 0).toString(16).toUpperCase().padStart(8, '0');

export const formatLayerKey = (value) => 
  String(value).padStart(2, '0');

export const formatEntryIndex = (value) => 
  String(value).padStart(4, '0');

export const formatEntryKey = (layer, index) => 
  `${formatLayerKey(layer)}.${formatEntryIndex(index)}`;

export const parseHexValue = (hexString) => 
  parseInt(hexString, 16) || 0;

export const parseDecimalValue = (decString) => 
  parseInt(decString, 10) || 0;

export const calculateOffset = (decIndex, hexValue) => 
  decIndex - (typeof hexValue === 'string' ? parseHexValue(hexValue) : hexValue);

export const formatHexDisplay = (decimalValue) => 
  `0x${formatHexValue(decimalValue)}`;

export const shiftEntryKey = (entryKey, amount) => {
  const [layer, index] = entryKey.split('.');
  const newIndex = parseDecimalValue(index) + amount;
  return formatEntryKey(layer, newIndex);
};