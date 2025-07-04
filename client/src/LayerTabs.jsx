import React from 'react';
import './LayerTabs.css';

export default function LayerTabs({ layers, selected, onSelect, onAdd, orientation = 'horizontal' }) {
  if (!layers || layers.length === 0) return null;
  return (
    <div className={`layer-tabs ${orientation}`}>
      {layers.map(layer => (
        <button
          key={layer.key}
          className={layer.key === selected ? 'tab active' : 'tab'}
          onClick={() => onSelect(layer.key)}
        >
          {layer.key}
        </button>
      ))}
      {onAdd && (
        <button className="tab add" onClick={onAdd}>+</button>
      )}
    </div>
  );
}
