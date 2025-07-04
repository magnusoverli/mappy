import { useState, useEffect } from 'react';
import './App.css';
import { openFile, exportFile } from './FileAgent.js';
import { parseIni, stringifyIni } from './ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from './LayersAgent.js';
import { loadState, saveState, clearState } from './StorageAgent.js';
import { groupTargetsByLayer } from './TargetsAgent.js';
import { groupSourcesByLayer } from './SourcesAgent.js';
import LayerTabs from './LayerTabs.jsx';
import LayerPanel from './LayerPanel.jsx';

function App() {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [targets, setTargets] = useState({});
  const [sources, setSources] = useState({});
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');

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

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
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
    }
  };

  const download = () => {
    if (!iniData) return;
    const text = stringifyIni(iniData, newline);
    exportFile(text, fileName);
  };

  const handlePathChange = (key, value) => {
    const index = layers.findIndex(l => l.key === key);
    if (index === -1) return;
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    updateLayer(dataCopy, index, key, value);
    setIniData(dataCopy);
    setLayers(listLayers(dataCopy));
  };

  const handleAddLayer = () => {
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    const newKey = addLayer(dataCopy);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    setSelectedLayer(newKey);
  };

  const handleRemoveLayer = key => {
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    removeLayer(dataCopy, key);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    setSelectedLayer(updated[0]?.key || null);
  };

  const reset = () => {
    setIniData(null);
    setLayers([]);
    setTargets({});
    setSources({});
    setSelectedLayer(null);
    setFileName('mappingfile.ini');
    setNewline('\n');
    setStatus('');
    clearState();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mappy INI Editor</h1>
        <div className="toolbar">
          <input type="file" accept=".ini" onChange={handleFileChange} />
          <button onClick={download} disabled={!iniData}>Download</button>
          <button onClick={reset}>Reset</button>
        </div>
      </header>
      {iniData && (
        <div className="editor-grid">
          <aside className="sidebar">
            <LayerTabs
              layers={layers}
              selected={selectedLayer}
              onSelect={setSelectedLayer}
              onAdd={handleAddLayer}
              orientation="vertical"
            />
          </aside>
          <main className="content">
            <LayerPanel
              layer={layers.find(l => l.key === selectedLayer)}
              targets={targets[selectedLayer] || []}
              sources={sources[selectedLayer] || []}
              onPathChange={handlePathChange}
              onRemove={handleRemoveLayer}
            />
          </main>
        </div>
      )}
      <footer className="status-bar">{status}</footer>
    </div>
  );
}

export default App;
