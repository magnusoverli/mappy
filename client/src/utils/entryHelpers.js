export function groupByLayer(entries = {}) {
  const result = {};
  Object.entries(entries).forEach(([key, value]) => {
    const [layer, indexPart] = key.split('.');
    const decIndex = parseInt(indexPart, 10);
    const hexVal = parseInt(value, 16);
    const offset = decIndex - hexVal;
    if (!result[layer]) result[layer] = [];
    result[layer].push({ key, value, offset });
  });
  return result;
}

export function removeLayerEntries(entries = {}, layer) {
  Object.keys(entries).forEach(key => {
    if (key.startsWith(`${layer}.`)) delete entries[key];
  });
}

export function setLayerEntries(entries = {}, layer, newEntries = []) {
  removeLayerEntries(entries, layer);
  newEntries.forEach(e => {
    entries[e.key] = e.value;
  });
}
