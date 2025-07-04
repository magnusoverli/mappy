import { Box, Paper, Typography, TextField, Button, ListItem, ListItemText } from '@mui/material';
import { FixedSizeList } from 'react-window';
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
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Targets
          </Typography>
          <FixedSizeList
            height={Math.min(300, targets.length * 36)}
            itemCount={targets.length}
            itemSize={36}
            width="100%"
          >
            {({ index, style }) => {
              const t = targets[index];
              return (
                <ListItem style={style} key={t.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
                  <ListItemText primary={<span className="mono">{t.key} = {t.value}</span>} />
                </ListItem>
              );
            }}
          </FixedSizeList>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Sources
          </Typography>
          <FixedSizeList
            height={Math.min(300, sources.length * 36)}
            itemCount={sources.length}
            itemSize={36}
            width="100%"
          >
            {({ index, style }) => {
              const s = sources[index];
              return (
                <ListItem style={style} key={s.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
                  <ListItemText primary={<span className="mono">{s.key} = {s.value}</span>} />
                </ListItem>
              );
            }}
          </FixedSizeList>
        </Paper>
      </Box>
    </Box>
  );
};

export default memo(LayerPanel);

