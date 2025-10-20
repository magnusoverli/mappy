import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FONTS } from '../../../utils/styleConstants.js';

export default function AddEntriesSection({ 
  entries, 
  selectedItems, 
  onAddEntries, 
  onDeleteSelected, 
  processing 
}) {
  const [quantity, setQuantity] = useState(1);
  const [firstKey, setFirstKey] = useState('');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-populate suggested values
  useEffect(() => {
    if (entries.length > 0) {
      // Find next available key
      const existingKeys = entries.map(e => {
        const parts = e.key.split('.');
        return parseInt(parts[1], 10);
      }).filter(k => !isNaN(k));
      
      const nextKey = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
      setFirstKey(nextKey.toString().padStart(4, '0'));
      
      // Calculate common offset pattern
      const offsets = entries.map(e => e.offset);
      const commonOffset = offsets.length > 0 ? Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length) : 0;
      setOffset(commonOffset);
    } else {
      setFirstKey('0001');
      setOffset(0);
    }
  }, [entries]);

  const validateInputs = () => {
    if (quantity < 1 || quantity > 1000) {
      return 'Quantity must be between 1 and 1000';
    }
    
    const keyNum = parseInt(firstKey, 10);
    if (isNaN(keyNum) || keyNum < 0 || keyNum > 9999) {
      return 'First key must be between 0000 and 9999';
    }
    
    // Check for conflicts with existing entries
    const layerPrefix = entries.length > 0 ? entries[0].key.split('.')[0] : '00';
    const conflicts = [];
    
    for (let i = 0; i < quantity; i++) {
      const newKey = `${layerPrefix}.${(keyNum + i).toString().padStart(4, '0')}`;
      if (entries.some(e => e.key === newKey)) {
        conflicts.push(newKey);
      }
    }
    
    if (conflicts.length > 0) {
      return `Key conflicts: ${conflicts.join(', ')}`;
    }
    
    return null;
  };

  const handleAddBatch = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    
    const layerPrefix = entries.length > 0 ? entries[0].key.split('.')[0] : '00';
    const keyNum = parseInt(firstKey, 10);
    
    const newEntries = [];
    for (let i = 0; i < quantity; i++) {
      const newKey = `${layerPrefix}.${(keyNum + i).toString().padStart(4, '0')}`;
      newEntries.push({
        key: newKey,
        value: '00000000', // Default hex value
        offset: offset
      });
    }
    
    await onAddEntries(newEntries);
    
    // Update first key for next batch
    setFirstKey((keyNum + quantity).toString().padStart(4, '0'));
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await onDeleteSelected();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Box sx={{ 
      p: 2.5, 
      borderBottom: '4px solid',
      borderImage: 'linear-gradient(135deg, #283593 0%, #8e24aa 100%) 1',
      backgroundColor: 'background.default',
      mb: 1
    }}>
      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'bold' }}>
        Add Entries
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Suggested values based on existing entries
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Math.min(1000, parseInt(e.target.value) || 0)))}
          size="small"
          inputProps={{ 
            min: 0, 
            max: 1000,
            style: { fontFamily: FONTS.MONOSPACE }
          }}
          disabled={processing}
        />
        
        <TextField
          label="First Key"
          value={firstKey}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
            setFirstKey(value.padStart(4, '0'));
          }}
          size="small"
          inputProps={{ 
            maxLength: 4,
            style: { fontFamily: FONTS.MONOSPACE }
          }}
          disabled={processing}
          helperText="4-digit number (0000-9999)"
        />
        
        <TextField
          label="Offset"
          type="number"
          value={offset}
          onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
          size="small"
          inputProps={{ 
            style: { fontFamily: FONTS.MONOSPACE }
          }}
          disabled={processing}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBatch}
            disabled={quantity === 0 || processing}
            sx={{ flex: 1 }}
          >
            ADD BATCH
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={selectedItems.size === 0 || processing}
            sx={{ flex: 1 }}
          >
            DELETE SELECTED
          </Button>
        </Box>
      </Box>

      <Dialog
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Entries</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedItems.size} selected {selectedItems.size === 1 ? 'entry' : 'entries'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}