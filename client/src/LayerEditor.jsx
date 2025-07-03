import React from 'react';
import './LayerEditor.css';

export default function LayerEditor({ layers, onChange, onAdd, onRemove }) {
  return (
    <div className="layer-editor">
      <div className="layer-header">
        <span className="col-key">Layer</span>
        <span className="col-value">Path</span>
        <span className="col-actions" />
      </div>
      {layers.map((layer, index) => (
        <div className="layer-row" key={index}>
          <input
            className="key-input"
            value={layer.key}
            onChange={e => onChange(index, e.target.value, layer.value)}
          />
          <input
            className="value-input"
            value={layer.value}
            onChange={e => onChange(index, layer.key, e.target.value)}
          />
          <button className="remove-btn" onClick={() => onRemove(layer.key)}>✕</button>
        </div>
      ))}
      <button className="add-btn" onClick={onAdd}>Add Layer</button>
    </div>
  );
}
