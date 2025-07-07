import { groupByLayer, removeLayerEntries as removeEntriesFromLayer } from './utils/entryHelpers.js';

export function groupEntriesByLayer(data, entryType) {
  return groupByLayer(data[entryType] || {});
}

export function removeLayerEntries(data, layer, entryType) {
  if (data[entryType]) removeEntriesFromLayer(data[entryType], layer);
}

export function groupTargetsByLayer(data) {
  return groupEntriesByLayer(data, 'Targets');
}

export function removeLayerTargets(data, layer) {
  return removeLayerEntries(data, layer, 'Targets');
}

export function groupSourcesByLayer(data) {
  return groupEntriesByLayer(data, 'Sources');
}

export function removeLayerSources(data, layer) {
  return removeLayerEntries(data, layer, 'Sources');
}