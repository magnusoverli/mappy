export function groupTargetsByLayer(data) {
  const result = {};
  if (!data.Targets) return result;
  Object.entries(data.Targets).forEach(([key, value]) => {
    const layer = key.split('.')[0];
    if (!result[layer]) result[layer] = [];
    result[layer].push({ key, value });
  });
  return result;
}
