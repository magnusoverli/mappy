import { groupByLayer, removeLayerEntries } from './utils/entryHelpers.js';

export function groupSourcesByLayer(data) {
  return groupByLayer(data.Sources || {});
}

export function removeLayerSources(data, layer) {
  if (data.Sources) removeLayerEntries(data.Sources, layer);
}
