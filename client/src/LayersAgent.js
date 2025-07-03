export function listLayers(data) {
  return Object.entries(data.Layers || {}).map(([key, value]) => ({ key, value }));
}

export function updateLayer(data, index, newKey, newValue) {
  const keys = Object.keys(data.Layers || {});
  const oldKey = keys[index];
  if (!data.Layers) data.Layers = {};
  if (oldKey && oldKey !== newKey) {
    delete data.Layers[oldKey];
  }
  data.Layers[newKey] = newValue;
}

export function addLayer(data) {
  if (!data.Layers) data.Layers = {};
  const newKey = findNextKey(data);
  data.Layers[newKey] = '';
  return newKey;
}

function findNextKey(data) {
  const keys = Object.keys(data.Layers).map(k => parseInt(k, 10)).sort((a, b) => a - b);
  let next = 0;
  while (keys.includes(next)) next += 1;
  return String(next).padStart(2, '0');
}

export function removeLayer(data, key) {
  if (data.Layers) {
    delete data.Layers[key];
  }
}
