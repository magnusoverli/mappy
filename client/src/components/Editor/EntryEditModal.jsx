import {
  Dialog,
  Typography,
  IconButton,
  Box,
  Button,
  TextField,
  DialogActions,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Collapse,
} from '@mui/material';
import { useEffect, useState, memo, useRef, useCallback } from 'react';
import useHighlightColors from '../../utils/useHighlightColors.js';
import { useSearch } from '../../hooks/useSearch.jsx';
import AppToolbar from '../Layout/AppToolbar.jsx';
import SearchField from '../Common/SearchField.jsx';
import VirtualizedList from '../Common/VirtualizedList.jsx';

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
  const [selected, setSelected] = useState([]);
  const [lastIndex, setLastIndex] = useState(null);
  const [batchQty, setBatchQty] = useState(1);
  const [batchStart, setBatchStart] = useState(0);
  const [batchOffset, setBatchOffset] = useState(0);

  const [transformType, setTransformType] = useState('adjust');
  const [adjustMode, setAdjustMode] = useState('add');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [skipZero, setSkipZero] = useState(false);

  const [seqStart, setSeqStart] = useState(0);
  const [seqIncrement, setSeqIncrement] = useState(1);

  const [fixedValue, setFixedValue] = useState('');

  const [shiftDir, setShiftDir] = useState('up');
  const [shiftAmount, setShiftAmount] = useState(1);

  const [preview, setPreview] = useState([]);
  const [changedCount, setChangedCount] = useState(0);

  const dialogRef = useRef(null);

  const helpTexts = {
    adjust: 'Shift all selected values up or down by a fixed amount',
    sequential: 'Renumber values in sequence (like 1, 2, 3...)',
    fixed: 'Change all selected entries to exactly the same value',
    shift: 'Shift entry keys up or down in the list',
  };

  useEffect(() => {
    if (open) {
      const mapped = entries.map(e => ({ ...e }));
      setRows(mapped);
      const last = mapped[mapped.length - 1];
      const startIdx = last ? parseInt(last.key.split('.')[1], 10) + 1 : 0;
      const off = last ? last.offset : 0;
      setBatchStart(startIdx);
      setBatchOffset(off);
      setBatchQty(1);
      setSelected([]);
      setLastIndex(null);
    }
  }, [open, entries]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        if (dialogRef.current && dialogRef.current.contains(e.target)) {
          const tag = e.target.tagName;
          const editable = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
          if (!editable) {
            e.preventDefault();
            setSelected(rows.map((_, idx) => idx));
            setLastIndex(rows.length - 1);
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, rows]);


  const handleRowClick = (index, e) => {
    if (e.shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);
      const range = [];
      for (let i = start; i <= end; i++) range.push(i);
      setSelected(range);
    } else {
      setSelected([index]);
      setLastIndex(index);
    }
  };

  const handleRowMouseDown = (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleCellChange = (index, field, value) => {
    const newRows = rows.slice();
    newRows[index][field] = value.toUpperCase();
    const dec = parseInt(newRows[index].key.split('.')[1], 10);
    const hex = parseInt(newRows[index].value, 16);
    newRows[index].offset = dec - (isNaN(hex) ? 0 : hex);
    setRows(newRows);
  };

  const handleDelete = () => {
    const remaining = rows.filter((_, i) => !selected.includes(i));
    setRows(remaining);
    setSelected([]);
  };

  const handleAddBatch = () => {
    const newRows = rows.slice();
    for (let i = 0; i < batchQty; i++) {
      const decIndex = batchStart + i;
      const key = `${layerKey}.${String(decIndex).padStart(4, '0')}`;
      const val = (decIndex - batchOffset)
        .toString(16)
        .toUpperCase()
        .padStart(8, '0');
      newRows.push({ key, value: val, offset: batchOffset });
    }
    setRows(newRows);
    const nextStart = batchStart + batchQty;
    setBatchStart(nextStart);
  };

  const transformRows = useCallback((sourceRows) => {
    const updated = sourceRows.map(r => ({ ...r }));
    const sel = selected.slice();
    if (transformType === 'adjust') {
      sel.forEach(i => {
        const row = updated[i];
        if (skipZero && row.offset === 0) return;
        const val = parseInt(row.value, 16) || 0;
        const amt = parseInt(adjustAmount, 10) || 0;
        const newVal = adjustMode === 'add' ? val + amt : val - amt;
        row.value = (newVal >>> 0).toString(16).toUpperCase().padStart(8, '0');
        const dec = parseInt(row.key.split('.')[1], 10);
        row.offset = dec - newVal;
      });
    } else if (transformType === 'sequential') {
      let current = parseInt(seqStart, 10) || 0;
      const order = sel.slice().sort((a, b) =>
        parseInt(updated[a].key.split('.')[1], 10) -
        parseInt(updated[b].key.split('.')[1], 10));
      order.forEach(i => {
        const row = updated[i];
        row.value = (current >>> 0).toString(16).toUpperCase().padStart(8, '0');
        const dec = parseInt(row.key.split('.')[1], 10);
        row.offset = dec - current;
        current += parseInt(seqIncrement, 10) || 0;
      });
    } else if (transformType === 'fixed') {
      if (/^[0-9A-Fa-f]{8}$/.test(fixedValue)) {
        const val = parseInt(fixedValue, 16);
        sel.forEach(i => {
          const row = updated[i];
          row.value = fixedValue.toUpperCase();
          const dec = parseInt(row.key.split('.')[1], 10);
          row.offset = dec - val;
        });
      }
    } else if (transformType === 'shift') {
      const amt = parseInt(shiftAmount, 10) || 0;
      const dir = shiftDir === 'up' ? 1 : -1;
      sel.forEach(i => {
        const row = updated[i];
        const parts = row.key.split('.');
        const dec = parseInt(parts[1], 10) + dir * amt;
        parts[1] = String(dec).padStart(4, '0');
        row.key = parts.join('.');
        const val = parseInt(row.value, 16) || 0;
        row.offset = dec - val;
      });
    }
    return updated;
  }, [selected, transformType, adjustMode, adjustAmount, skipZero, seqStart, seqIncrement, fixedValue, shiftDir, shiftAmount]);

  useEffect(() => {
    const updated = transformRows(rows);
    const pv = [];
    let count = 0;
    selected.forEach(i => {
      const changed = rows[i].key !== updated[i].key || rows[i].value !== updated[i].value;
      if (changed) {
        count += 1;
        if (pv.length < 10) {
          pv.push({
            oldKey: rows[i].key,
            newKey: updated[i].key,
            oldValue: rows[i].value,
            newValue: updated[i].value,
          });
        }
      }
    });
    setPreview(pv);
    setChangedCount(count);
  }, [rows, selected, transformType, adjustMode, adjustAmount, skipZero, seqStart, seqIncrement, fixedValue, shiftDir, shiftAmount, transformRows]);

  const hasShiftConflict = () => {
    if (transformType !== 'shift') return false;
    const amt = parseInt(shiftAmount, 10) || 0;
    const dir = shiftDir === 'up' ? 1 : -1;
    const newKeys = new Set();
    const existing = new Set(rows.map(r => r.key));
    selected.forEach(i => {
      const parts = rows[i].key.split('.');
      const dec = parseInt(parts[1], 10) + dir * amt;
      const key = `${parts[0]}.${String(dec).padStart(4, '0')}`;
      newKeys.add(key);
    });
    for (const key of newKeys) {
      if (existing.has(key) && !selected.some(i => rows[i].key === key)) return true;
    }
    return false;
  };

  const canApply = () => {
    if (selected.length < 2) return false;
    if (changedCount === 0) return false;
    if (transformType === 'fixed' && !/^[0-9A-F]{8}$/.test(fixedValue)) return false;
    if (transformType === 'shift' && hasShiftConflict()) return false;
    return true;
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

  const keyRegex = /^\d{2}\.\d{4}$/;
  const valRegex = /^[0-9A-Fa-f]{8}$/;
  const { query, matchSet, currentResult } = useSearch() || {};
  const { highlight, currentHighlight } = useHighlightColors();

  const renderRow = (row, i, style) => {
    const isMatch = matchSet?.has(row.key);
    const isCurrent = currentResult?.key === row.key;
    return (
      <Paper
        style={style}
        key={i}
        onMouseDown={handleRowMouseDown}
        onClick={e => handleRowClick(i, e)}
        sx={theme => {
          const base = {
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 0,
            minHeight: 0,
            borderRadius: 1,
            transition: 'background-color 0.3s',
            '&:hover': { bgcolor: 'action.hover' },
          };
          if (selected.includes(i)) {
            base.boxShadow = `0 0 0 2px ${theme.palette.primary.main} inset`;
            if (!isMatch) base.bgcolor = 'action.selected';
          }
          if (isMatch) base.bgcolor = highlight;
          if (query && !isMatch) base.opacity = 0.7;
          if (isCurrent) base.bgcolor = currentHighlight;
          return base;
        }}
      >
        <TextField
          value={row.key}
          onChange={e => handleCellChange(i, 'key', e.target.value)}
          variant="standard"
          error={!keyRegex.test(row.key)}
          sx={{ width: '40%' }}
          InputProps={{
            disableUnderline: true,
            sx: { fontFamily: '"JetBrains Mono", monospace' },
          }}
        />
        <TextField
          value={row.value}
          onChange={e => handleCellChange(i, 'value', e.target.value)}
          variant="standard"
          error={!valRegex.test(row.value)}
          sx={{ width: '40%' }}
          InputProps={{
            disableUnderline: true,
            sx: { fontFamily: '"JetBrains Mono", monospace' },
          }}
        />
        <Box
          sx={{
            width: '20%',
            textAlign: 'right',
            fontFamily: '"JetBrains Mono", monospace',
            color: row.offset === 0 ? 'success.dark' : 'error.dark',
          }}
        >
          {row.offset}
        </Box>
      </Paper>
    );
  };

  return (
    <Dialog
        ref={dialogRef}
        fullScreen
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { display: 'flex', flexDirection: 'column', bgcolor: 'background.default' } }}
      >
        <AppToolbar position="relative">
          <Typography
            variant="h4"
            component="div"
            sx={{ fontFamily: '"Baloo 2", sans-serif', fontWeight: 'bold', mr: 2 }}
          >
            Mappy
          </Typography>
          <SearchField />
          <Typography
            variant="h6"
            component="div"
            sx={{ flex: 1, ml: 2, fontFamily: '"Baloo 2", sans-serif', fontWeight: 'bold' }}
          >
            {layerLabel} - Editing {type}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </AppToolbar>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', fontWeight: 'bold', mb: 1, fontFamily: '"JetBrains Mono", monospace' }}>
            <Box sx={{ width: '40%' }}>Key</Box>
            <Box sx={{ width: '40%' }}>Value</Box>
            <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
          </Box>
          <VirtualizedList
            items={rows}
            itemHeight={36}
            renderRow={renderRow}
          />
        </Box>
        <Box sx={{ width: 500, borderLeft: 1, borderColor: 'divider', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1">Add Entries</Typography>
          <TextField
            label="Quantity"
            type="number"
            value={batchQty}
            onChange={e => setBatchQty(parseInt(e.target.value, 10) || 0)}
            size="small"
            InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
          />
          <TextField
            label="Start Index"
            type="number"
            value={batchStart}
            onChange={e => setBatchStart(parseInt(e.target.value, 10) || 0)}
            size="small"
            InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
          />
          <TextField
            label="Offset"
            type="number"
            value={batchOffset}
            onChange={e => setBatchOffset(parseInt(e.target.value, 10) || 0)}
            size="small"
            InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
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
                    <MenuItem value="adjust">Shift Values Up/Down</MenuItem>
                    <MenuItem value="sequential">Number Values in Order</MenuItem>
                    <MenuItem value="fixed">Set Same Value for All</MenuItem>
                    <MenuItem value="shift">Shift Keys Up/Down</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {helpTexts[transformType]}
                </Typography>

                {transformType === 'adjust' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <RadioGroup
                      row
                      value={adjustMode}
                      onChange={e => setAdjustMode(e.target.value)}
                    >
                      <FormControlLabel value="add" control={<Radio />} label="Add" />
                      <FormControlLabel value="subtract" control={<Radio />} label="Subtract" />
                    </RadioGroup>
                    <TextField
                      label={adjustMode === 'add' ? 'Amount to add' : 'Amount to subtract'}
                      type="number"
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                      size="small"
                      helperText={`= 0x${(parseInt(adjustAmount, 10) >>> 0).toString(16).toUpperCase().padStart(8, '0')}`}
                      InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={skipZero} onChange={e => setSkipZero(e.target.checked)} />}
                      label="Skip entries with zero offset"
                    />
                  </Box>
                )}

                {transformType === 'sequential' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      label="Start counting from"
                      type="number"
                      value={seqStart}
                      onChange={e => setSeqStart(parseInt(e.target.value, 10) || 0)}
                      size="small"
                      helperText={`= 0x${(parseInt(seqStart, 10) >>> 0).toString(16).toUpperCase().padStart(8, '0')}`}
                      InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                    <TextField
                      label="Count by"
                      type="number"
                      value={seqIncrement}
                      onChange={e => setSeqIncrement(parseInt(e.target.value, 10) || 0)}
                      size="small"
                      helperText={`= 0x${(parseInt(seqIncrement, 10) >>> 0).toString(16).toUpperCase().padStart(8, '0')}`}
                      InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                  </Box>
                )}

                {transformType === 'fixed' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      label="New value for all"
                      value={fixedValue}
                      onChange={e => setFixedValue(e.target.value.toUpperCase())}
                      size="small"
                      inputProps={{ maxLength: 8 }}
                      helperText="8-digit hex value"
                      error={!/^([0-9A-F]{8})?$/.test(fixedValue)}
                      InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => setFixedValue('00000000')}>All 0</Button>
                      <Button size="small" onClick={() => setFixedValue('FFFFFFFF')}>All F</Button>
                    </Box>
                  </Box>
                )}

                {transformType === 'shift' && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <RadioGroup
                      row
                      value={shiftDir}
                      onChange={e => setShiftDir(e.target.value)}
                    >
                      <FormControlLabel value="up" control={<Radio />} label="↑ Move to higher keys" />
                      <FormControlLabel value="down" control={<Radio />} label="↓ Move to lower keys" />
                    </RadioGroup>
                    <TextField
                      label="Move by"
                      type="number"
                      value={shiftAmount}
                      onChange={e => setShiftAmount(parseInt(e.target.value, 10) || 0)}
                      size="small"
                      InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    />
                    <Typography variant="body2" color="warning.main">
                      Shifting keys may create conflicts if new keys already exist.
                    </Typography>
                  </Box>
                )}

                {selected.length >= 2 && (
                  <Paper variant="outlined" sx={{ mt: 1, p: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      What will happen:
                    </Typography>
                    {preview.map((p, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: '"JetBrains Mono", monospace',
                          mb: 0.5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>{`${p.oldKey} = ${p.oldValue}`}</Box>
                        <Box sx={{ mx: 1 }}>→</Box>
                        <Box sx={{ flex: 1, color: 'primary.main' }}>{`${p.newKey} = ${p.newValue}`}</Box>
                      </Box>
                    ))}
                    {changedCount - preview.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {`...and ${changedCount - preview.length} more entries`}
                      </Typography>
                    )}
                  </Paper>
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(EntryEditModal);
