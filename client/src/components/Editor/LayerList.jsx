import { Box, ListItemButton, ListItemText } from '@mui/material';
import { memo, useLayoutEffect, useRef, useState } from 'react';
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

  const longestLabel = layers.reduce((acc, l) => {
    const label = formatLayerLabel(l.key, l.value);
    return label.length > acc.length ? label : acc;
  }, '');

  const measureRef = useRef(null);
  const [width, setWidth] = useState('auto');

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (!cancelled && measureRef.current) {
        setWidth(`${measureRef.current.offsetWidth}px`);
      }
    };

    measure();

    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      document.fonts.ready.then(measure);
    }

    return () => {
      cancelled = true;
    };
  }, [longestLabel]);

  return (
    <>
      <ListItemButton
        ref={measureRef}
        sx={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          px: 2,
          whiteSpace: 'nowrap',
        }}
      >
        <ListItemText
          primary={longestLabel}
          primaryTypographyProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
        />
      </ListItemButton>
      <EntryList
        title="Layers"
        items={layers}
        renderRow={renderRow}
        header={header}
        footer={footer}
        paperProps={{ sx: { flex: '0 0 auto', width } }}
      />
    </>
  );
};

export default memo(LayerList);
