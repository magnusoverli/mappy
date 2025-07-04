import React from 'react';
import './LayerPanel.css';

export default function LayerPanel({ layer, targets, sources, onPathChange, onRemove }) {
  if (!layer) return null;
  return (
    <div className="layer-panel">
      <div className="layer-path">
        <label>Layer {layer.key}</label>
        <input
          className="path-input"
          value={layer.value}
          onChange={e => onPathChange(layer.key, e.target.value)}
        />
        {onRemove && (
          <button className="remove-btn" onClick={() => onRemove(layer.key)}>Delete</button>
        )}
      </div>
      <div className="layer-section">
        <h3>Targets</h3>
        <ul>
          {targets.map(t => (
            <li key={t.key}>{t.key} = {t.value}</li>
          ))}
        </ul>
      </div>
      <div className="layer-section">
        <h3>Sources</h3>
        <ul>
          {sources.map(s => (
            <li key={s.key}>{s.key} = {s.value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
