import {
  Modal,
  Typography,
  IconButton,
  Box,
  Button,
  Paper,
} from '@mui/material';
import MonospaceTextField from '../Common/MonospaceTextField.jsx';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import { useEffect, useState, memo, useRef, useCallback, useMemo } from 'react';

import AppToolbar from '../Layout/AppToolbar.jsx';
import SearchField from '../Common/SearchField.jsx';
import EditableDataTable from '../Common/EditableDataTable.jsx';
import { SPACING, FONTS } from '../../utils/styleConstants.js';
import { 
  formatHexValue, 
  formatEntryKey, 
  parseHexValue, 
  parseDecimalValue, 
  calculateOffset,
  formatHexDisplay,
  shiftEntryKey 
} from '../../utils/conversionUtils.js';
import { 
  validateEntryKey, 
  validateHexValue, 
  validatePartialHexValue 
} from '../../utils/validationUtils.js';

function EntryEditModal({
  open,
  onClose,
  onSave,
  entries = [],
  layerLabel = '',
  layerKey = '',
  type = 'Targets',
}) {
  const [rows, setRows] = useState([]);
  const [originalEntries, setOriginalEntries] = useState([]);
  const [selected, setSelected] = useState([]);

  const [batchQty, setBatchQty] = useState(1);
  const [batchStart, setBatchStart] = useState(0);
  const [batchOffset, setBatchOffset] = useState(0);

  const [transformType, setTransformType] = useState('shift');
  const [adjustAmount, setAdjustAmount] = useState(0);

  const [seqStart, setSeqStart] = useState(0);
  const [seqIncrement, setSeqIncrement] = useState(1);

  const [fixedValue, setFixedValue] = useState('');

  const [shiftAmount, setShiftAmount] = useState(1);



  const dialogRef = useRef(null);

  const helpTexts = {
    adjust: 'Shift entry values by a fixed amount (use negative numbers to move down)',
    sequential: 'Renumber values in sequence (like 1, 2, 3...)',
    fixed: 'Change all selected entries to exactly the same value',
    shift: 'Shift entry keys by a fixed amount (use negative numbers to move down)',
  };

  useEffect(() => {
    if (!open) return;
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      setRows([]);
      setOriginalEntries([]);
      setBatchStart(0);
      setBatchOffset(0);
      setBatchQty(1);
      setSelected([]);
      setTransformType('shift');
      return;
    }

    const mapped = entries.map(e => ({ ...e, value: e.value.toUpperCase() }));
    setRows(mapped);
    setOriginalEntries(mapped.map(e => ({ ...e })));
    
    const last = mapped[mapped.length - 1];
    const startIdx = last ? parseInt(last.key.split('.')[1], 10) + 1 : 0;
    const offset = last ? last.offset || 0 : 0;
    
    setBatchStart(startIdx);
    setBatchOffset(offset);
    setBatchQty(1);
    setSelected([]);
    setTransformType('shift');
  }, [open, entries, type]);




  const handleSelectionChange = (newSelected) => {
    setSelected(newSelected);
  };

  const handleItemChange = (index, field, value) => {
    const newRows = rows.slice();
    newRows[index][field] = field === 'value' ? value.toUpperCase() : value;
    const dec = parseDecimalValue(newRows[index].key.split('.')[1]);
    const hex = parseHexValue(newRows[index].value);
    newRows[index].offset = calculateOffset(dec, hex);
    setRows(newRows);
  };



  const handleDelete = () => {
    const remaining = rows.filter((_, i) => !selected.includes(i));
    setRows(remaining);
    setSelected([]);
  };

  const handleAddBatch = useCallback(() => {
    if (batchQty <= 0 || batchQty > 1000) return;
    
    try {
      const newRows = rows.slice();
      const existingKeys = new Set(newRows.map(r => r.key));
      
      for (let i = 0; i < batchQty; i++) {
        const decIndex = batchStart + i;
        const key = formatEntryKey(layerKey, decIndex);
        
        // Skip if key already exists
        if (existingKeys.has(key)) continue;
        
        const val = formatHexValue(Math.max(0, decIndex - batchOffset));
        newRows.push({ key, value: val, offset: batchOffset });
      }
      
      setRows(newRows);
      const nextStart = batchStart + batchQty;
      setBatchStart(nextStart);
    } catch (error) {
      console.error('Batch add error:', error);
    }
  }, [rows, batchQty, batchStart, batchOffset, layerKey]);

  const transformRows = useMemo(() => {
    return (sourceRows) => {
      if (!sourceRows || sourceRows.length === 0 || selected.length === 0) {
        return sourceRows;
      }

      const updated = sourceRows.map(r => ({ ...r }));
      const sel = selected.slice();
      
      try {
        if (transformType === 'adjust') {
          const amt = parseDecimalValue(adjustAmount);
          sel.forEach(i => {
            if (i >= 0 && i < updated.length) {
              const row = updated[i];
              const val = parseHexValue(row.value);
              const newVal = val + amt;
              row.value = formatHexValue(newVal);
              const dec = parseDecimalValue(row.key.split('.')[1]);
              row.offset = calculateOffset(dec, newVal);
            }
          });
        } else if (transformType === 'sequential') {
          let current = parseDecimalValue(seqStart);
          const increment = parseDecimalValue(seqIncrement);
          const order = sel.slice().sort((a, b) =>
            parseDecimalValue(updated[a].key.split('.')[1]) -
            parseDecimalValue(updated[b].key.split('.')[1]));
          order.forEach(i => {
            if (i >= 0 && i < updated.length) {
              const row = updated[i];
              row.value = formatHexValue(current);
              const dec = parseDecimalValue(row.key.split('.')[1]);
              row.offset = calculateOffset(dec, current);
              current += increment;
            }
          });
        } else if (transformType === 'fixed') {
          if (validateHexValue(fixedValue)) {
            const val = parseHexValue(fixedValue);
            sel.forEach(i => {
              if (i >= 0 && i < updated.length) {
                const row = updated[i];
                 row.value = fixedValue.toUpperCase();                const dec = parseDecimalValue(row.key.split('.')[1]);
                row.offset = calculateOffset(dec, val);
              }
            });
          }
        } else if (transformType === 'shift') {
          const amt = parseDecimalValue(shiftAmount);
          sel.forEach(i => {
            if (i >= 0 && i < updated.length) {
              const row = updated[i];
              row.key = shiftEntryKey(row.key, amt);
              const dec = parseDecimalValue(row.key.split('.')[1]);
              const val = parseHexValue(row.value);
              row.offset = calculateOffset(dec, val);
            }
          });
        }
      } catch (error) {
        console.error('Transform error:', error);
        return sourceRows;
      }
      
      return updated;
    };
  }, [selected, transformType, adjustAmount, seqStart, seqIncrement, fixedValue, shiftAmount]);

  const { preview, changedCount } = useMemo(() => {
    if (!rows || rows.length === 0 || selected.length === 0) {
      return { preview: [], changedCount: 0 };
    }

    try {
      const updated = transformRows(rows);
      const pv = [];
      let count = 0;
      const maxPreview = 10;
      
      selected.forEach(i => {
        if (i >= 0 && i < rows.length && i < updated.length) {
          const changed = rows[i].key !== updated[i].key || rows[i].value !== updated[i].value;
          if (changed) {
            count += 1;
            if (pv.length < maxPreview) {
              pv.push({
                oldKey: rows[i].key,
                newKey: updated[i].key,
                oldValue: rows[i].value,
                newValue: updated[i].value,
              });
            }
          }
        }
      });
      
      return { preview: pv, changedCount: count };
    } catch (error) {
      console.error('Preview calculation error:', error);
      return { preview: [], changedCount: 0 };
    }
  }, [rows, selected, transformType, adjustAmount, seqStart, seqIncrement, fixedValue, shiftAmount, transformRows]);

  const hasShiftConflict = () => {
    if (transformType !== 'shift') return false;
    const amt = parseDecimalValue(shiftAmount);
    const newKeys = new Set();
    const existing = new Set(rows.map(r => r.key));
    selected.forEach(i => {
      const key = shiftEntryKey(rows[i].key, amt);
      newKeys.add(key);
    });
    for (const key of newKeys) {
      if (existing.has(key) && !selected.some(i => rows[i].key === key)) return true;
    }
    return false;
  };

  const hasAdjustConflict = () => {
    if (transformType !== 'adjust') return false;
    const amt = parseDecimalValue(adjustAmount);
    const newVals = new Set();
    const existing = new Set(rows.map(r => r.value));
    selected.forEach(i => {
      const val = parseHexValue(rows[i].value);
      const newVal = val + amt;
      const valStr = formatHexValue(newVal);
      newVals.add(valStr);
    });
    for (const val of newVals) {
      if (existing.has(val) && !selected.some(i => rows[i].value === val)) return true;
    }
    return false;
  };

  const canApply = () => {
    if (selected.length < 2) return false;
    if (changedCount === 0) return false;
    if (transformType === 'fixed' && !validateHexValue(fixedValue)) return false;
    if (transformType === 'shift' && hasShiftConflict()) return false;
    if (transformType === 'adjust' && hasAdjustConflict()) return false;
    return true;
  };

  const hasChanges = () => {
    if (rows.length !== originalEntries.length) return true;
    return rows.some((row, i) => {
      const original = originalEntries[i];
      return !original || row.key !== original.key || row.value !== original.value;
    });
  };

  const applyTransform = () => {
    if (!canApply()) return;
    const updated = transformRows(rows);
    setRows(updated);
  };

  const handleSave = () => {
    onSave(rows.map(r => ({ key: r.key, value: r.value })));
    onClose();
  };





  return (
    <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }
        }}
      >
        <Paper
          ref={dialogRef}
          sx={{
            width: '65vw',
            height: '85vh',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            outline: 'none',
            transform: open ? 'translateY(0)' : 'translateY(50px)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
        <AppToolbar position="relative">
          <Typography
            variant="h5"
            component="div"
            sx={{ fontFamily: FONTS.BRAND, fontWeight: 'bold', mr: 2 }}
          >
            Mappy
          </Typography>
          <Box sx={{ maxWidth: 300 }}>
            <SearchField />
          </Box>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ flex: 1, ml: 2, fontFamily: FONTS.BRAND, fontWeight: 'bold' }}
          >
            {layerLabel} - Editing {type}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </AppToolbar>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {rows.length === 0 ? (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                No entries to edit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some entries using the controls on the right to get started.
              </Typography>
            </Box>
          ) : (
            <EditableDataTable
              items={rows}
              selected={selected}
              onSelectionChange={handleSelectionChange}
              onItemChange={handleItemChange}
              validateKey={validateEntryKey}
              validateValue={validateHexValue}
              itemHeight={36}
              paperProps={{ sx: { flex: 1, p: 0 } }}
            />
          )}
        </Box>
        <Box sx={{ 
          width: 450, 
          minWidth: 400, 
          maxWidth: 500, 
          borderLeft: 1, 
          borderColor: 'divider', 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}>
          <Typography variant="subtitle1">Add Entries</Typography>
          <MonospaceTextField
            label="Quantity"
            type="number"
            value={batchQty}
            onChange={e => setBatchQty(Math.max(0, Math.min(1000, parseInt(e.target.value, 10) || 0)))}
            inputProps={{ min: 0, max: 1000 }}
            size="small"
          />
          <MonospaceTextField
            label="First Key"
            type="number"
            value={batchStart}
            onChange={e => setBatchStart(Math.max(0, Math.min(9999, parseInt(e.target.value, 10) || 0)))}
            inputProps={{ min: 0, max: 9999 }}
            size="small"
          />
          <MonospaceTextField
            label="Offset"
            type="number"
            value={batchOffset}
            onChange={e => setBatchOffset(parseInt(e.target.value, 10) || 0)}
            inputProps={{ min: -2147483648, max: 2147483647 }}
            size="small"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBatch}>
            Add Batch
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selected.length === 0}
            onClick={handleDelete}
          >
            Delete Selected
          </Button>
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
            <Typography variant="subtitle1">
              {`Transform Selected Entries (${selected.length} selected)`}
            </Typography>
            {selected.length < 2 ? (
              <Typography variant="body2" color="text.secondary">
                Select 2 or more entries to enable transformations.
              </Typography>
            ) : (
              <Collapse in={selected.length >= 2}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>What do you want to do?</InputLabel>
                  <Select
                    label="What do you want to do?"
                    value={transformType}
                    onChange={e => setTransformType(e.target.value)}
                  >
                    <MenuItem value="shift">Shift Keys Up/Down</MenuItem>
                    <MenuItem value="adjust">Shift Values Up/Down</MenuItem>
                    <MenuItem value="sequential">Number Values in Order</MenuItem>
                    <MenuItem value="fixed">Set Same Value for All</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {helpTexts[transformType]}
                </Typography>

                {transformType === 'adjust' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <MonospaceTextField
                      label="Move by"
                      type="number"
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: -2147483648, max: 2147483647 }}
                      size="small"
                    />
                    {hasAdjustConflict() && (
                      <Typography variant="body2" color="error.main">
                        Conflicts detected
                      </Typography>
                    )}
                  </Box>
                )}

                {transformType === 'sequential' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <MonospaceTextField
                      label="Start counting from"
                      type="number"
                      value={seqStart}
                      onChange={e => setSeqStart(parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0, max: 4294967295 }}
                      size="small"
                      helperText={`= ${formatHexDisplay(parseDecimalValue(seqStart))}`}
                    />
                    <MonospaceTextField
                      label="Count by"
                      type="number"
                      value={seqIncrement}
                      onChange={e => setSeqIncrement(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      inputProps={{ min: 1, max: 1000 }}
                      size="small"
                      helperText={`= ${formatHexDisplay(parseDecimalValue(seqIncrement))}`}
                    />
                  </Box>
                )}

                {transformType === 'fixed' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <MonospaceTextField
                      label="New value for all"
                      value={fixedValue}
                       onChange={e => setFixedValue(e.target.value.toUpperCase())}                      size="small"
                      inputProps={{ maxLength: 8 }}
                      helperText="8-digit hex value"
                      error={!validatePartialHexValue(fixedValue)}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => setFixedValue('00000000')}>All 0</Button>
                      <Button size="small" onClick={() => setFixedValue('FFFFFFFF')}>All F</Button>
                    </Box>
                  </Box>
                )}

                {transformType === 'shift' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <MonospaceTextField
                      label="Move by"
                      type="number"
                      value={shiftAmount}
                      onChange={e => setShiftAmount(parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: -9999, max: 9999 }}
                      size="small"
                    />
                    {hasShiftConflict() && (
                      <Typography variant="body2" color="error.main">
                        Conflicts detected
                      </Typography>
                    )}
                  </Box>
                )}

                {selected.length >= 2 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                      What will happen:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      {changedCount === 0 && (
                        <Typography variant="body2">No changes</Typography>
                      )}
                      {changedCount > 0 &&
                        preview.map((p, idx) => (
                           <Box
                             key={idx}
                             sx={{
                               display: 'grid',
                               gridTemplateColumns: '1fr auto 1fr',
                               columnGap: 2,
                               alignItems: 'center',
                               fontFamily: FONTS.MONOSPACE,
                               fontSize: '0.8rem',
                               mb: SPACING.MARGIN_SMALL,
                               whiteSpace: 'nowrap',
                             }}
                           >                            <Box sx={{ textAlign: 'right' }}>{`${p.oldKey} = ${p.oldValue}`}</Box>
                            <ArrowRightAltIcon sx={{ fontSize: '1.3rem' }} />
                            <Box>{`${p.newKey} = ${p.newValue}`}</Box>
                          </Box>
                        ))}
                      {changedCount > 0 && changedCount - preview.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {`...and ${changedCount - preview.length} more entries`}
                        </Typography>
                      )}
                    </Paper>
                  </>
                )}

                <Button
                  variant="contained"
                  sx={{ mt: 1 }}
                  disabled={!canApply()}
                  onClick={applyTransform}
                >
                  {`Apply to ${changedCount} entries`}
                </Button>
              </Collapse>
            )}
          </Box>
        </Box>
      </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={!hasChanges()}>
              Save
            </Button>
          </Box>
        </Paper>
    </Modal>
  );
}

export default memo(EntryEditModal);
