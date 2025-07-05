import { groupByLayer, removeLayerEntries } from './utils/entryHelpers.js';

export function groupTargetsByLayer(data) {
  return groupByLayer(data.Targets || {});
}

export function removeLayerTargets(data, layer) {
  if (data.Targets) removeLayerEntries(data.Targets, layer);
}
