import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/mapping')
      .then(res => res.text())
      .then(setText)
      .catch(err => {
        console.error(err);
        setStatus('Failed to load file');
      });
  }, []);

  const save = async () => {
    setStatus('Saving...');
    try {
      const res = await fetch('/api/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setStatus('Saved');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Error');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error');
    }
  };

  return (
    <div className="container">
      <h1>Mappy INI Editor</h1>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={20}
        cols={80}
      />
      <div>
        <button onClick={save}>Save</button>
        <span className="status">{status}</span>
      </div>
    </div>
  );
}

export default App;
