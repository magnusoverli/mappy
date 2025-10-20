import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert 
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { FONTS } from '../../../utils/styleConstants.js';
import { validateHexValue } from '../../../utils/validationUtils.js';

export default function EntryEditSection({ 
  entries, 
  selectedItems, 
  onUpdateEntries, 
  processing 
}) {
  const [editedKey, setEditedKey] = useState('');
  const [editedValue, setEditedValue] = useState('');
  const [error, setError] = useState('');
  const [originalEntry, setOriginalEntry] = useState(null);

  const selectedCount = selectedItems.size;
  const selectedEntry = selectedCount === 1 
    ? entries.find(entry => selectedItems.has(entry.key))
    : null;

  useEffect(() => {
    if (selectedEntry) {
      setOriginalEntry(selectedEntry);
      setEditedKey(selectedEntry.key);
      setEditedValue(selectedEntry.value);
      setError('');
    } else {
      setOriginalEntry(null);
      setEditedKey('');
      setEditedValue('');
      setError('');
    }
  }, [selectedEntry]);

  const validateInputs = () => {
    if (!editedKey) {
      return 'Key is required';
    }

    const keyPattern = /^\d{2}\.\d{4}$/;
    if (!keyPattern.test(editedKey)) {
      return 'Invalid key format (expected: XX.XXXX)';
    }

    if (!validateHexValue(editedValue)) {
      return 'Invalid hex value (expected: 8 hex digits)';
    }

    if (editedKey !== originalEntry.key) {
      const keyExists = entries.some(e => e.key === editedKey);
      if (keyExists) {
        return `Key "${editedKey}" already exists`;
      }
    }

    return null;
  };

  const handleApply = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    const keyParts = editedKey.split('.');
    const keyNum = parseInt(keyParts[1], 10);
    const hexNum = parseInt(editedValue, 16);
    const newOffset = keyNum - hexNum;

    const keyMapping = {};
    const updatedEntries = entries.map(entry => {
      if (entry.key === originalEntry.key) {
        if (entry.key !== editedKey) {
          keyMapping[entry.key] = editedKey;
        }
        return {
          ...entry,
          key: editedKey,
          value: editedValue.toLowerCase(),
          offset: newOffset
        };
      }
      return entry;
    });

    onUpdateEntries(updatedEntries, Object.keys(keyMapping).length > 0 ? keyMapping : null);
  };

  const handleKeyChange = (e) => {
    const value = e.target.value;
    if (value.length <= 7) {
      setEditedKey(value);
    }
  };

  const handleValueChange = (e) => {
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8);
    setEditedValue(value.toLowerCase());
  };

  const hasChanges = originalEntry && (
    editedKey !== originalEntry.key || 
    editedValue.toLowerCase() !== originalEntry.value.toLowerCase()
  );

  const getSubtitleText = () => {
    if (selectedCount === 0) {
      return 'Select an entry from the table to edit';
    }
    if (selectedCount > 1) {
      return 'Multiple entries selected. Select only one entry to edit individual values.';
    }
    return 'Modify the key and value for the selected entry';
  };

  const isDisabled = selectedCount !== 1 || processing;

  return (
    <Box sx={{ 
      p: 2.5, 
      borderBottom: '4px solid',
      borderImage: 'linear-gradient(135deg, #283593 0%, #8e24aa 100%) 1',
      backgroundColor: 'background.default',
      mb: 1
    }}>
      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'bold' }}>
        Edit Entry
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {getSubtitleText()}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Key"
          value={editedKey}
          onChange={handleKeyChange}
          size="small"
          inputProps={{ 
            maxLength: 7,
            style: { fontFamily: FONTS.MONOSPACE }
          }}
          disabled={isDisabled}
          helperText="Format: XX.XXXX (e.g., 00.0001)"
        />
        
        <TextField
          label="Value"
          value={editedValue}
          onChange={handleValueChange}
          size="small"
          inputProps={{ 
            maxLength: 8,
            style: { fontFamily: FONTS.MONOSPACE }
          }}
          disabled={isDisabled}
          error={editedValue.length === 8 && !validateHexValue(editedValue)}
          helperText="8-character hexadecimal value"
        />

        <Box sx={{ 
          p: 1.5, 
          backgroundColor: 'action.hover', 
          borderRadius: 1,
          fontFamily: FONTS.MONOSPACE,
          fontSize: '0.875rem',
          minHeight: 60
        }}>
          {originalEntry ? (
            <>
              <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                Current offset:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: FONTS.MONOSPACE,
                  color: originalEntry.offset === 0 ? 'success.dark' : 'error.dark'
                }}
              >
                {originalEntry.offset}
              </Typography>
              
              {hasChanges && editedKey && editedValue.length === 8 && validateHexValue(editedValue) && (
                <>
                  <Typography variant="caption" display="block" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }}>
                    New offset:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: FONTS.MONOSPACE,
                      color: (() => {
                        const keyParts = editedKey.split('.');
                        if (keyParts.length !== 2) return 'text.primary';
                        const keyNum = parseInt(keyParts[1], 10);
                        const hexNum = parseInt(editedValue, 16);
                        const newOffset = keyNum - hexNum;
                        return newOffset === 0 ? 'success.dark' : 'error.dark';
                      })()
                    }}
                  >
                    {(() => {
                      const keyParts = editedKey.split('.');
                      if (keyParts.length !== 2) return 'N/A';
                      const keyNum = parseInt(keyParts[1], 10);
                      const hexNum = parseInt(editedValue, 16);
                      return keyNum - hexNum;
                    })()}
                  </Typography>
                </>
              )}
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Offset will be displayed when an entry is selected
            </Typography>
          )}
        </Box>
        
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleApply}
          disabled={!hasChanges || isDisabled}
          fullWidth
        >
          Apply Changes
        </Button>
      </Box>
    </Box>
  );
}
