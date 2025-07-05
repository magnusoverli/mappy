import { Box, ListItemButton, ListItemText } from '@mui/material';
import { memo } from 'react';
import EntryList from '../Common/EntryList.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const LayerList = ({ layers = [], selected, onSelect, onAdd }) => {
  const header = null;
  const footer = (
    <ListItemButton onClick={onAdd} sx={{ justifyContent: 'center' }}>
      <ListItemText
        primary="+"
        sx={{ textAlign: 'center', fontWeight: 'bold' }}
        primaryTypographyProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
      />
    </ListItemButton>
  );

  const renderRow = (layer, _i, style) => (
    <Box style={style} key={layer.key}>
      <ListItemButton
        selected={layer.key === selected}
        onClick={() => onSelect(layer.key)}
        sx={{ mb: 0.5, borderRadius: 1, '&.Mui-selected': { bgcolor: 'action.selected' } }}
      >
        <ListItemText
          primary={formatLayerLabel(layer.key, layer.value)}
          primaryTypographyProps={{ noWrap: true, sx: { fontFamily: '"JetBrains Mono", monospace' } }}
        />
      </ListItemButton>
    </Box>
  );

  const maxLabelLength = layers.reduce(
    (max, l) => Math.max(max, formatLayerLabel(l.key, l.value).length),
    0,
  );

  const width = `calc(${maxLabelLength}ch + 2rem)`;

  return (
    <EntryList
      title="Layers"
      items={layers}
      renderRow={renderRow}
      header={header}
      footer={footer}
      paperProps={{ sx: { flex: '0 0 auto', width } }}
    />
  );
};

export default memo(LayerList);
