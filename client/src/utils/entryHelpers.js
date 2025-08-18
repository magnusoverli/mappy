export function groupByLayer(entries = {}) {
  if (!entries || typeof entries !== 'object') return {};
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
  if (!entries || typeof entries !== 'object') return;
  Object.keys(entries).forEach(key => {
    if (key.startsWith(`${layer}.`)) delete entries[key];
  });
}



export function validateLayerOrder(data) {
  if (!data.Layers) return data;
  
  const layerKeys = Object.keys(data.Layers);
  const orderKeys = data.__layerOrder || [];
  
  const missingFromOrder = layerKeys.filter(key => !orderKeys.includes(key));
  const invalidInOrder = orderKeys.filter(key => !layerKeys.includes(key));
  
  if (missingFromOrder.length > 0 || invalidInOrder.length > 0 || !data.__layerOrder) {
    const validOrder = orderKeys.filter(key => layerKeys.includes(key));
    const sortedMissing = missingFromOrder.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    data.__layerOrder = [...validOrder, ...sortedMissing];
  }
  
  return data;
}
