import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { openFile, exportFile } from '../FileAgent.js';
import { parseIni, stringifyIni } from '../ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from '../LayersAgent.js';
import { loadState, saveState, clearState } from '../StorageAgent.js';
import {
  groupTargetsByLayer,
  removeLayerTargets,
  groupSourcesByLayer,
  removeLayerSources,
  updateLayerEntries,
} from '../EntryAgent.js';


export default function useMappingEditor() {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Memoize expensive data transformations for better performance
  const targets = useMemo(() => {
    if (!iniData) return {};
    return groupTargetsByLayer(iniData);
  }, [iniData]);

  const sources = useMemo(() => {
    if (!iniData) return {};
    return groupSourcesByLayer(iniData);
  }, [iniData]);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      try {
        const parsed = parseIni(saved.text);
        setIniData(parsed);
        const layerList = listLayers(parsed);
        setLayers(layerList);
        // Targets and sources are now memoized, no need to set them
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
    // Debounce localStorage saves to improve performance
    if (iniData) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const text = stringifyIni(iniData, newline);
        saveState({ text, fileName, newline });
      }, 500); // 500ms debounce
    } else {
      clearState();
    }
    
    // Cleanup timeout on unmount or when dependencies change
    return () => clearTimeout(saveTimeoutRef.current);
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
      // Targets and sources are now memoized, no need to set them
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
    // Targets and sources are now memoized, no need to set them
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
    // Targets and sources are now memoized, no need to set them
    const nextKey =
      idx > 0 ? updated[idx - 1]?.key : updated[0]?.key || null;
    setSelectedLayer(nextKey);
  }, [iniData, layers]);

  const handleUpdateEntries = useCallback(async (layerKey, entryType, entries) => {
    const dataCopy = {
      ...iniData,
      Layers: { ...iniData.Layers },
      Targets: { ...iniData.Targets },
      Sources: { ...iniData.Sources },
    };
    
    updateLayerEntries(dataCopy, layerKey, entryType, entries);
    setIniData(dataCopy);
    // Targets and sources are now memoized, no need to set them
    setStatus(`Updated ${entryType.toLowerCase()} for layer ${layerKey}`);
  }, [iniData]);



  const reset = useCallback(() => {
    setIniData(null);
    setLayers([]);
    // Targets and sources are now memoized, they'll reset automatically when iniData is null
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
    handleUpdateEntries,
    reset,
  };
}

