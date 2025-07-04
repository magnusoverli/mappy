import { Box, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { memo } from 'react';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const LayerTabs = ({ layers, selected, onSelect, onAdd }) => {
  if (!layers || layers.length === 0) return null;

  return (
    <Box
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pt: 11,
        pr: 2,
        width: 'max-content',
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {layers.map(layer => (
            <Paper
              key={layer.key}
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
          ))}
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
