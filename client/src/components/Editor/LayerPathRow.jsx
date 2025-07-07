import { Paper, Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { memo, useState } from 'react';

const LayerPathRow = ({ layer, onPathChange, onAdd, onDelete, selectedLayer, layers = [] }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (layers.length <= 1) {
      // Could show error here, but for now just disable the button
      return;
    }
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete && onDelete();
    setConfirmDelete(false);
  };

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
        {onAdd && (
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Layer
          </Button>
        )}
        {onDelete && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            startIcon={<DeleteIcon />}
            sx={{ whiteSpace: 'nowrap' }}
            disabled={!selectedLayer || layers.length <= 1}
          >
            Delete Layer
          </Button>
        )}
      </Box>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>{`Delete Layer ${selectedLayer}?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default memo(LayerPathRow);
