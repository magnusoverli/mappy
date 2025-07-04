import { Box, ListItemButton, ListItemText, Paper } from '@mui/material';
import { FixedSizeList } from 'react-window';
import { memo } from 'react';

const ITEM_HEIGHT = 36;

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  if (!layers || layers.length === 0) return null;

  const height = Math.min(400, (layers.length + 1) * ITEM_HEIGHT);

  return (
    <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 120 }}>
      <FixedSizeList
        height={height}
        itemCount={layers.length + 1}
        itemSize={ITEM_HEIGHT}
        width={120}
      >
        {({ index, style }) => {
          if (index === layers.length) {
            return (
              <Paper style={style} sx={{ height: ITEM_HEIGHT, display: 'flex' }} elevation={1}>
                <ListItemButton onClick={onAdd} sx={{ justifyContent: 'center' }}>
                  <ListItemText primary="+" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
                </ListItemButton>
              </Paper>
            );
          }
          const layer = layers[index];
          return (
            <Paper
              style={style}
              elevation={layer.key === selected ? 2 : 1}
              sx={{ height: ITEM_HEIGHT, display: 'flex', '&:hover': { boxShadow: 3 } }}
            >
              <ListItemButton
                selected={layer.key === selected}
                onClick={() => onSelect(layer.key)}
                sx={{
                  width: '100%',
                  '&.Mui-selected': { bgcolor: 'action.selected' },
                }}
              >
                <ListItemText primary={layer.key} sx={{ fontFamily: 'monospace', textAlign: 'center' }} />
              </ListItemButton>
            </Paper>
          );
        }}
      </FixedSizeList>
    </Box>
  );
};

export default memo(LayerTabs);
