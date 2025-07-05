export function groupSourcesByLayer(data) {
  const result = {};
  if (!data.Sources) return result;
  Object.entries(data.Sources).forEach(([key, value]) => {
    const [layer, indexPart] = key.split('.');
    const decIndex = parseInt(indexPart, 10);
    const hexVal = parseInt(value, 16);
    const offset = decIndex - hexVal;
    if (!result[layer]) result[layer] = [];
    result[layer].push({ key, value, offset });
  });
  return result;
}

export function removeLayerSources(data, layer) {
  if (!data.Sources) return;
  Object.keys(data.Sources).forEach(key => {
    if (key.startsWith(`${layer}.`)) delete data.Sources[key];
  });
}
