import { useState } from 'react';
import './App.css';
import { openFile, exportFile } from './FileAgent.js';

function App() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [status, setStatus] = useState('');

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await openFile(file);
      setText(data);
      setFileName(file.name);
      setStatus(`Loaded ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to read file');
    }
  };

  const download = () => {
    exportFile(text, fileName);
  };

  return (
    <div className="container">
      <h1>Mappy INI Editor</h1>
      <input type="file" accept=".ini" onChange={handleFileChange} />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={20}
        cols={80}
      />
      <div>
        <button onClick={download}>Download</button>
        <span className="status">{status}</span>
      </div>
    </div>
  );
}

export default App;
