import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Button
} from '@mui/material';
import { FONTS } from '../../../utils/styleConstants.js';
import PreviewBox from './PreviewBox.jsx';

const TRANSFORM_TYPES = [
  {
    value: 'shift_keys',
    label: 'Shift Keys Up/Down',
    description: 'Move entry keys by specified amount. Direction defined by negative/positive number.',
  },
  {
    value: 'shift_values',
    label: 'Shift Values Up/Down', 
    description: 'Add/subtract from hex values. Direction defined by negative/positive number.',
  },
  {
    value: 'number_values',
    label: 'Number Values in Order',
    description: 'Set sequential numeric values',
  },
  {
    value: 'set_same_value',
    label: 'Set Same Value for All',
    description: 'Apply identical hex value to all',
  },
];

export default function TransformSection({ 
  entries, 
  selectedItems, 
  onApplyTransform, 
  processing 
}) {
  const [transformType, setTransformType] = useState('');
  const [moveBy, setMoveBy] = useState(1);
  const [startValue, setStartValue] = useState(1);
  const [countBy, setCountBy] = useState(1);
  const [hexValue, setHexValue] = useState('00000000');
  const [conflicts, setConflicts] = useState([]);
  const [preview, setPreview] = useState([]);

  const selectedEntries = entries.filter(entry => selectedItems.has(entry.key));
  const selectedCount = selectedItems.size;

  // Generate preview when parameters change
  useEffect(() => {
    if (selectedCount < 2 || !transformType) {
      setPreview([]);
      setConflicts([]);
      return;
    }

    const generatePreview = () => {
    const newPreview = [];
    const newConflicts = [];
    
    selectedEntries.forEach((entry, index) => {
      let newKey = entry.key;
      let newValue = entry.value;
      
      switch (transformType) {
        case 'shift_keys': {
          const keyParts = entry.key.split('.');
          const currentKeyNum = parseInt(keyParts[1], 10);
          const newKeyNum = Math.max(0, Math.min(9999, currentKeyNum + moveBy));
          newKey = `${keyParts[0]}.${newKeyNum.toString().padStart(4, '0')}`;
          break;
        }
          
        case 'shift_values': {
          const currentValue = parseInt(entry.value, 16);
          const newValueNum = Math.max(0, Math.min(0xFFFFFFFF, currentValue + moveBy));
          newValue = newValueNum.toString(16).toLowerCase().padStart(8, '0');
          break;
        }
          
        case 'number_values': {
          const sequentialValue = startValue + (index * countBy);
          newValue = Math.max(0, Math.min(0xFFFFFFFF, sequentialValue))
            .toString(16).toLowerCase().padStart(8, '0');
          break;
        }
          
        case 'set_same_value': {
          newValue = hexValue;
          break;
        }
      }
      
      // Check for conflicts
      if (newKey !== entry.key && entries.some(e => e.key === newKey && !selectedItems.has(e.key))) {
        newConflicts.push(newKey);
      }
      
      newPreview.push({
        oldKey: entry.key,
        oldValue: entry.value,
        newKey,
        newValue,
      });
    });
    
    setPreview(newPreview);
    setConflicts(newConflicts);
  };

    generatePreview();
  }, [transformType, moveBy, startValue, countBy, hexValue, selectedEntries, selectedCount, entries, selectedItems]);

  const handleApply = () => {
    if (conflicts.length > 0) return;
    
    const keyMapping = {};
    const transformedEntries = entries.map(entry => {
      if (!selectedItems.has(entry.key)) return entry;
      
      const previewItem = preview.find(p => p.oldKey === entry.key);
      if (!previewItem) return entry;
      
      // Track key changes for selection update
      if (previewItem.oldKey !== previewItem.newKey) {
        keyMapping[previewItem.oldKey] = previewItem.newKey;
      }
      
      return {
        ...entry,
        key: previewItem.newKey,
        value: previewItem.newValue,
      };
    });
    
    onApplyTransform(transformedEntries, keyMapping);
    
    // Reset form
    setTransformType('');
    setPreview([]);
    setConflicts([]);
  };

  const isHexValid = (value) => /^[0-9A-Fa-f]{8}$/.test(value);

  if (selectedCount < 2) {
    return (
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Transform Selected Entries (0 selected)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select 2 or more entries to enable transformations.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'bold' }}>
        Transform Selected Entries ({selectedCount} selected)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <FormControl size="small" disabled={processing}>
          <InputLabel>Transform Type</InputLabel>
          <Select
            value={transformType}
            onChange={(e) => setTransformType(e.target.value)}
            label="Transform Type"
          >
            {TRANSFORM_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {transformType && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
            {TRANSFORM_TYPES.find(t => t.value === transformType)?.description}
          </Typography>
        )}
        
        {/* Dynamic parameter fields */}
        {transformType === 'shift_keys' && (
          <TextField
            label="Move by"
            type="number"
            value={moveBy}
            onChange={(e) => setMoveBy(parseInt(e.target.value) || 0)}
            size="small"
            inputProps={{ style: { fontFamily: FONTS.MONOSPACE } }}
            disabled={processing}
            helperText="Positive = up, negative = down"
          />
        )}
        
        {transformType === 'shift_values' && (
          <TextField
            label="Move by"
            type="number"
            value={moveBy}
            onChange={(e) => setMoveBy(parseInt(e.target.value) || 0)}
            size="small"
            inputProps={{ style: { fontFamily: FONTS.MONOSPACE } }}
            disabled={processing}
            helperText="Positive = add, negative = subtract"
          />
        )}
        
        {transformType === 'number_values' && (
          <>
            <TextField
              label="Start counting from"
              type="number"
              value={startValue}
              onChange={(e) => setStartValue(parseInt(e.target.value) || 1)}
              size="small"
              inputProps={{ style: { fontFamily: FONTS.MONOSPACE } }}
              disabled={processing}
              helperText={`Hex: ${startValue.toString(16).toLowerCase().padStart(8, '0')}`}
            />
            <TextField
              label="Count by"
              type="number"
              value={countBy}
              onChange={(e) => setCountBy(parseInt(e.target.value) || 1)}
              size="small"
              inputProps={{ style: { fontFamily: FONTS.MONOSPACE } }}
              disabled={processing}
              helperText={`Hex increment: ${countBy.toString(16).toLowerCase().padStart(8, '0')}`}
            />
          </>
        )}
        
        {transformType === 'set_same_value' && (
          <TextField
            label="Hex value"
            value={hexValue}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8);
              setHexValue(value.toLowerCase());
            }}
            size="small"
            inputProps={{ 
              maxLength: 8,
              style: { fontFamily: FONTS.MONOSPACE }
            }}
            disabled={processing}
            error={hexValue.length === 8 && !isHexValid(hexValue)}
            helperText="8-character hexadecimal value"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-error fieldset': {
                  borderColor: 'error.main',
                },
              },
            }}
          />
        )}
        
        {conflicts.length > 0 && (
          <Alert severity="error">
            Key conflicts: {conflicts.join(', ')}
          </Alert>
        )}
        
        {preview.length > 0 && (
          <PreviewBox 
            preview={preview} 
            onApply={handleApply}
            disabled={conflicts.length > 0 || processing}
          />
        )}
      </Box>
    </Box>
  );
}