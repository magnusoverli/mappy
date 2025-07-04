import { Paper, Box, Typography, TextField, Button } from '@mui/material';
import { memo } from 'react';

const LayerPathRow = ({ layer, onPathChange, onRemove }) => {
  if (!layer) return null;
  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Typography variant="h6" component="div" sx={{ whiteSpace: 'nowrap' }}>
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
  );
};

export default memo(LayerPathRow);
