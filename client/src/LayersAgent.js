import { parseDecimalValue, formatLayerKey } from './utils/conversionUtils.js';
import { validateLayerOrder } from './utils/entryHelpers.js';

export function listLayers(data) {
  return Object.entries(data.Layers || {})
    .sort((a, b) => parseDecimalValue(a[0]) - parseDecimalValue(b[0]))
    .map(([key, value]) => ({ key, value }));
}

export function updateLayer(data, index, newKey, newValue) {
  const keys = Object.keys(data.Layers || {});
  const oldKey = keys[index];
  if (!data.Layers) data.Layers = {};
  if (oldKey && oldKey !== newKey) {
    delete data.Layers[oldKey];
    if (Array.isArray(data.__layerOrder)) {
      const i = data.__layerOrder.indexOf(oldKey);
      if (i !== -1) data.__layerOrder[i] = newKey;
    }
  }
  data.Layers[newKey] = newValue;
  return validateLayerOrder(data);
}

export function addLayer(data) {
  if (!data.Layers) data.Layers = {};
  const newKey = findNextKey(data);
  data.Layers[newKey] = '';
  if (Array.isArray(data.__layerOrder)) {
    data.__layerOrder.push(newKey);
  } else {
    data.__layerOrder = [newKey];
  }
  validateLayerOrder(data);
  return newKey;
}

function findNextKey(data) {
  const keys = Object.keys(data.Layers).map(k => parseDecimalValue(k)).sort((a, b) => a - b);
  let next = 0;
  while (keys.includes(next)) next += 1;
  return formatLayerKey(next);
}

export function removeLayer(data, key) {
  if (data.Layers) {
    delete data.Layers[key];
  }
  if (Array.isArray(data.__layerOrder)) {
    const idx = data.__layerOrder.indexOf(key);
    if (idx !== -1) data.__layerOrder.splice(idx, 1);
  }
  return validateLayerOrder(data);
}
