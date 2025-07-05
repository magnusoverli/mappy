export function groupTargetsByLayer(data) {
  const result = {};
  if (!data.Targets) return result;
  Object.entries(data.Targets).forEach(([key, value]) => {
    const [layer, indexPart] = key.split('.');
    const decIndex = parseInt(indexPart, 10);
    const hexVal = parseInt(value, 16);
    const offset = decIndex - hexVal;
    if (!result[layer]) result[layer] = [];
    result[layer].push({ key, value, offset });
  });
  return result;
}

export function removeLayerTargets(data, layer) {
  if (!data.Targets) return;
  Object.keys(data.Targets).forEach(key => {
    if (key.startsWith(`${layer}.`)) delete data.Targets[key];
  });
}

export function replaceLayerTargets(data, layer, entries) {
  if (!data.Targets) data.Targets = {};
  Object.keys(data.Targets).forEach(key => {
    if (key.startsWith(`${layer}.`)) delete data.Targets[key];
  });
  entries.forEach(({ key, value }) => {
    data.Targets[key] = value;
  });
}
