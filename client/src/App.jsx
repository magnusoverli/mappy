import { useState, useEffect } from 'react';
import './App.css';
import { openFile, exportFile } from './FileAgent.js';
import { parseIni, stringifyIni } from './ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from './LayersAgent.js';
import { loadState, saveState, clearState } from './StorageAgent.js';
import LayerEditor from './LayerEditor.jsx';

function App() {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      try {
        const parsed = parseIni(saved.text);
        setIniData(parsed);
        setLayers(listLayers(parsed));
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
      setLayers(listLayers(parsed));
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

  const reset = () => {
    setIniData(null);
    setLayers([]);
    setFileName('mappingfile.ini');
    setNewline('\n');
    setStatus('');
    clearState();
  };

  return (
    <div className="container">
      <h1>Mappy INI Editor</h1>
      <input type="file" accept=".ini" onChange={handleFileChange} />
      {iniData && (
        <div className="editor">
          <LayerEditor
            layers={layers}
            onChange={(i, k, v) => {
              const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
              updateLayer(dataCopy, i, k, v);
              setIniData(dataCopy);
              setLayers(listLayers(dataCopy));
            }}
            onAdd={() => {
              const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
              addLayer(dataCopy);
              setIniData(dataCopy);
              setLayers(listLayers(dataCopy));
            }}
            onRemove={key => {
              const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
              removeLayer(dataCopy, key);
              setIniData(dataCopy);
              setLayers(listLayers(dataCopy));
            }}
          />
        </div>
      )}
      <div className="buttons">
        <button onClick={download}>Download</button>
        <button onClick={reset}>Reset</button>
        <span className="status">{status}</span>
      </div>
    </div>
  );
}

export default App;
