import { Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { memo } from 'react';

const LayerPanel = ({ layer, targets, sources, onPathChange, onRemove }) => {
  if (!layer) return null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div">
            Layer {layer.key}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={layer.value}
            onChange={e => onPathChange(layer.key, e.target.value)}
            label="Path"
          />
          {onRemove && (
            <Button color="error" onClick={() => onRemove(layer.key)}>
              Delete
            </Button>
          )}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Targets
        </Typography>
        <List dense disablePadding>
          {targets.map(t => (
            <ListItem key={t.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
              <ListItemText primary={<span className="mono">{t.key} = {t.value}</span>} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Sources
        </Typography>
        <List dense disablePadding>
          {sources.map(s => (
            <ListItem key={s.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
              <ListItemText primary={<span className="mono">{s.key} = {s.value}</span>} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default memo(LayerPanel);

