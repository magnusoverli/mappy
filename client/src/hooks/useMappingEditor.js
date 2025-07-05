import { useState, useEffect, useCallback } from 'react';
import { openFile, exportFile } from '../FileAgent.js';
import { parseIni, stringifyIni } from '../ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from '../LayersAgent.js';
import { loadState, saveState, clearState } from '../StorageAgent.js';
import {
  groupTargetsByLayer,
  removeLayerTargets,
} from '../TargetsAgent.js';
import {
  groupSourcesByLayer,
  removeLayerSources,
} from '../SourcesAgent.js';
import { setLayerEntries } from '../utils/entryHelpers.js';

export default function useMappingEditor() {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [targets, setTargets] = useState({});
  const [sources, setSources] = useState({});
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      try {
        const parsed = parseIni(saved.text);
        setIniData(parsed);
        const layerList = listLayers(parsed);
        setLayers(layerList);
        setTargets(groupTargetsByLayer(parsed));
        setSources(groupSourcesByLayer(parsed));
        setSelectedLayer(layerList[0]?.key || null);
        setFileName(saved.fileName || 'mappingfile.ini');
        setNewline(saved.newline || '\n');
        setStatus('Restored previous session');
      } catch (err) {
        console.error(err);
        clearState();
      }
    }
  }, []);

  useEffect(() => {
    if (iniData) {
      const text = stringifyIni(iniData, newline);
      saveState({ text, fileName, newline });
    } else {
      clearState();
    }
  }, [iniData, fileName, newline]);

  const handleFileChange = useCallback(async e => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const { text, newline } = await openFile(file);
      const parsed = parseIni(text);
      setIniData(parsed);
      const layerList = listLayers(parsed);
      setLayers(layerList);
      setTargets(groupTargetsByLayer(parsed));
      setSources(groupSourcesByLayer(parsed));
      setSelectedLayer(layerList[0]?.key || null);
      setFileName(file.name);
      setNewline(newline);
      setStatus(`Loaded ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to read file');
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(() => {
    if (!iniData) return;
    const text = stringifyIni(iniData, newline);
    exportFile(text, fileName);
  }, [iniData, newline, fileName]);

  const handlePathChange = useCallback((key, value) => {
    const index = layers.findIndex(l => l.key === key);
    if (index === -1) return;
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    updateLayer(dataCopy, index, key, value);
    setIniData(dataCopy);
    setLayers(listLayers(dataCopy));
  }, [iniData, layers]);

  const handleAddLayer = useCallback(() => {
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    const newKey = addLayer(dataCopy);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    setSelectedLayer(newKey);
  }, [iniData]);

  const handleRemoveLayer = useCallback(key => {
    const idx = layers.findIndex(l => l.key === key);
    const dataCopy = {
      ...iniData,
      Layers: { ...iniData.Layers },
      Targets: { ...iniData.Targets },
      Sources: { ...iniData.Sources },
    };
    removeLayer(dataCopy, key);
    removeLayerTargets(dataCopy, key);
    removeLayerSources(dataCopy, key);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    const nextKey =
      idx > 0 ? updated[idx - 1]?.key : updated[0]?.key || null;
    setSelectedLayer(nextKey);
  }, [iniData, layers]);

  const saveTargets = useCallback((layerKey, entries) => {
    const dataCopy = { ...iniData, Targets: { ...iniData.Targets } };
    setLayerEntries(dataCopy.Targets, layerKey, entries);
    setIniData(dataCopy);
    setTargets(groupTargetsByLayer(dataCopy));
  }, [iniData]);

  const saveSources = useCallback((layerKey, entries) => {
    const dataCopy = { ...iniData, Sources: { ...iniData.Sources } };
    setLayerEntries(dataCopy.Sources, layerKey, entries);
    setIniData(dataCopy);
    setSources(groupSourcesByLayer(dataCopy));
  }, [iniData]);

  const reset = useCallback(() => {
    setIniData(null);
    setLayers([]);
    setTargets({});
    setSources({});
    setSelectedLayer(null);
    setFileName('mappingfile.ini');
    setNewline('\n');
    setStatus('');
    clearState();
  }, []);

  return {
    iniData,
    layers,
    targets,
    sources,
    selectedLayer,
    fileName,
    newline,
    status,
    loading,
    setStatus,
    setSelectedLayer,
    handleFileChange,
    download,
    handlePathChange,
    handleAddLayer,
    handleRemoveLayer,
    saveTargets,
    saveSources,
    reset,
  };
}

