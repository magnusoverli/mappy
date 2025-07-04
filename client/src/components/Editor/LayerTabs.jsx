import { Box, ListItemButton, ListItemText } from '@mui/material';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo } from 'react';

const ITEM_HEIGHT = 36;

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  if (!layers || layers.length === 0) return null;

  return (
    <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 120, height: '100%' }}>
      <AutoSizer disableWidth>
        {({ height }) => (
          <FixedSizeList
            height={height}
            itemCount={layers.length + 1}
            itemSize={ITEM_HEIGHT}
            width={120}
          >
            {({ index, style }) => {
              if (index === layers.length) {
                return (
                  <ListItemButton style={style} onClick={onAdd} sx={{ justifyContent: 'center' }}>
                    <ListItemText primary="+" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
                  </ListItemButton>
                );
              }
              const layer = layers[index];
              return (
                <ListItemButton
                  style={style}
                  selected={layer.key === selected}
                  onClick={() => onSelect(layer.key)}
                  sx={{ '&.Mui-selected': { bgcolor: 'action.selected' } }}
                >
                  <ListItemText primary={layer.key} sx={{ fontFamily: 'monospace' }} />
                </ListItemButton>
              );
            }}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
};

export default memo(LayerTabs);
