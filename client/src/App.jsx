import { useState, useEffect } from 'react';
import './App.css';
import { openFile, exportFile } from './FileAgent.js';
import { parseIni, stringifyIni } from './ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from './LayersAgent.js';
import LayerEditor from './LayerEditor.jsx';
import { loadSession, saveSession, clearSession } from './SessionAgent.js';

function App() {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await loadSession();
      if (!saved) return;
      try {
        const { text, fileName: name, newline: nl } = saved;
        const parsed = parseIni(text);
        setIniData(parsed);
        setLayers(listLayers(parsed));
        setFileName(name);
        setNewline(nl);
        setStatus(`Restored ${name}`);
      } catch (err) {
        console.error(err);
        clearSession();
      }
    })();
  }, []);

  useEffect(() => {
    if (iniData) {
      const text = stringifyIni(iniData, newline);
      saveSession({ text, fileName, newline });
    }
  }, [iniData, newline, fileName]);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await clearSession();
      const { text, newline } = await openFile(file);
      const parsed = parseIni(text);
      setIniData(parsed);
      setLayers(listLayers(parsed));
      setFileName(file.name);
      setNewline(newline);
      setStatus(`Loaded ${file.name}`);
      saveSession({ text, fileName: file.name, newline });
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
        <span className="status">{status}</span>
      </div>
    </div>
  );
}

export default App;
