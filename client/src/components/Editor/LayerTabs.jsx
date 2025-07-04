import { Box, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useEffect, useMemo, useState } from 'react';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const ITEM_HEIGHT = 36;

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  const hasLayers = layers && layers.length > 0;

  const labels = useMemo(
    () => (hasLayers ? layers.map(l => formatLayerLabel(l.key, l.value)) : []),
    [layers, hasLayers]
  );

  const [listWidth, setListWidth] = useState(0);

  useEffect(() => {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'nowrap';
    span.style.fontFamily = '"JetBrains Mono", monospace';
    span.style.fontSize = '16px';
    document.body.appendChild(span);

    const measure = () => {
      let max = 0;
      span.textContent = '+';
      max = span.offsetWidth;
      for (const label of labels) {
        span.textContent = label;
        const w = span.offsetWidth;
        if (w > max) max = w;
      }
      setListWidth(Math.ceil(max + 32)); // padding for ListItemButton
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    window.addEventListener('resize', measure);

    return () => {
      span.remove();
      window.removeEventListener('resize', measure);
    };
  }, [labels]);

  const containerWidth = listWidth + 32; // account for Paper padding
  
  if (!hasLayers) return null;

  return (
    <Box
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        width: containerWidth + 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pt: 11,
        pr: 2,
      }}
    >
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
                          <ListItemText
                            primary="+"
                            sx={{ textAlign: 'center', fontWeight: 'bold' }}
                            primaryTypographyProps={{ noWrap: true, sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                          />
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
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{ noWrap: true, sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                        />
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
