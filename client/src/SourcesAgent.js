export function groupSourcesByLayer(data) {
  const result = {};
  if (!data.Sources) return result;
  Object.entries(data.Sources).forEach(([key, value]) => {
    const layer = key.split('.')[0];
    if (!result[layer]) result[layer] = [];
    result[layer].push({ key, value });
  });
  return result;
}
