import { Box, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import VirtualizedList from '../Common/VirtualizedList.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  const [tabsWidth, setTabsWidth] = useState('max-content');

  useEffect(() => {
    if (!layers || layers.length === 0) {
      setTabsWidth('max-content');
      return;
    }

    const measure = () => {
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      span.style.fontFamily = '"JetBrains Mono", monospace';
      span.style.fontSize = '16px';
      document.body.appendChild(span);

      let max = 0;
      for (const l of layers) {
        span.textContent = formatLayerLabel(l.key, l.value);
        max = Math.max(max, span.offsetWidth);
      }
      document.body.removeChild(span);
      setTabsWidth(`${max + 32}px`);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    } else {
      measure();
    }
  }, [layers]);

  if (!layers || layers.length === 0) return null;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pr: 2,
        width: tabsWidth,
      }}
    >
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Layers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minHeight: 0 }}>
          <VirtualizedList
            items={layers}
            itemHeight={48}
            renderRow={(layer, _i, style) => (
              <Box style={style} key={layer.key}>
                <Paper
                  elevation={layer.key === selected ? 2 : 1}
                  sx={{ '&:hover': { boxShadow: 3 } }}
                >
                  <ListItemButton
                    selected={layer.key === selected}
                    onClick={() => onSelect(layer.key)}
                    sx={{ '&.Mui-selected': { bgcolor: 'action.selected' } }}
                  >
                    <ListItemText
                      primary={formatLayerLabel(layer.key, layer.value)}
                      primaryTypographyProps={{ noWrap: true, sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                  </ListItemButton>
                </Paper>
              </Box>
            )}
          />
          <Paper elevation={1}>
            <ListItemButton onClick={onAdd} sx={{ justifyContent: 'center' }}>
              <ListItemText
                primary="+"
                sx={{ textAlign: 'center', fontWeight: 'bold' }}
                primaryTypographyProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
              />
            </ListItemButton>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(LayerTabs);
