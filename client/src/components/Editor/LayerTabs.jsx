import { Tabs, Tab } from '@mui/material';
import { memo } from 'react';

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  if (!layers || layers.length === 0) return null;
  const selectedIndex = layers.findIndex(l => l.key === selected);
  const handleChange = (e, idx) => {
    if (idx < layers.length) {
      onSelect(layers[idx].key);
    }
  };
  return (
    <Tabs
      orientation="vertical"
      value={selectedIndex}
      onChange={handleChange}
      variant="scrollable"
      sx={{ borderRight: 1, borderColor: 'divider', minWidth: 120, '& .MuiTab-root': { alignItems: 'flex-start' }, '& .MuiTabs-indicator': { width: 4 } }}
    >
      {layers.map(layer => (
        <Tab key={layer.key} label={layer.key} sx={{ transition: 'background-color 0.3s', '&.Mui-selected': { bgcolor: 'action.selected' } }} />
      ))}
      <Tab label="+" onClick={onAdd} sx={{ fontWeight: 'bold' }} />
    </Tabs>
  );
};

export default memo(LayerTabs);

