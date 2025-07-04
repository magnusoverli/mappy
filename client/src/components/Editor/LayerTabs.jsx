import { Box, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useMemo } from 'react';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const ITEM_HEIGHT = 36;

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  const hasLayers = layers && layers.length > 0;

  const labels = useMemo(
    () => (hasLayers ? layers.map(l => formatLayerLabel(l.key, l.value)) : []),
    [layers, hasLayers]
  );

  const listWidth = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '16px monospace';
    const plusWidth = ctx.measureText('+').width;
    let max = plusWidth;
    for (const label of labels) {
      const w = ctx.measureText(label).width;
      if (w > max) max = w;
    }
    return Math.ceil(max + 32); // padding for ListItemButton
  }, [labels]);

  const containerWidth = listWidth + 32; // account for Paper padding

  if (!hasLayers) return null;

  return (
    <Box
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        width: containerWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pt: 3,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        Mappy
      </Typography>
      <Paper
        sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Layers
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <FixedSizeList
                height={height}
                itemCount={layers.length + 1}
                itemSize={ITEM_HEIGHT}
                width={listWidth}
              >
                {({ index, style }) => {
                  if (index === layers.length) {
                    return (
                      <Paper
                        style={style}
                        sx={{ height: ITEM_HEIGHT, display: 'flex' }}
                        elevation={1}
                      >
                        <ListItemButton onClick={onAdd} sx={{ justifyContent: 'center' }}>
                          <ListItemText primary="+" sx={{ textAlign: 'center', fontWeight: 'bold' }} />
                        </ListItemButton>
                      </Paper>
                    );
                  }
                  const layer = layers[index];
                  const label = formatLayerLabel(layer.key, layer.value);
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
                        <ListItemText primary={label} sx={{ fontFamily: 'monospace' }} />
                      </ListItemButton>
                    </Paper>
                  );
                }}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(LayerTabs);
