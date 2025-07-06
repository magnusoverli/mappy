import {
  Dialog,
  Typography,
  IconButton,
  Box,
  Button,
  TextField,
  DialogActions,
  Paper,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState, useMemo } from 'react';
import useHighlightColors from '../../utils/useHighlightColors.js';
import { useSearch } from '../../hooks/useSearch.jsx';
import AppToolbar from '../Layout/AppToolbar.jsx';
import SearchField from '../Common/SearchField.jsx';

const keyRegex = /^\d{2}\.\d{4}$/;
const valRegex = /^[0-9A-Fa-f]{8}$/;

export default function EntryEditModal({
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

  const [transformType, setTransformType] = useState('Adjust Values');
  const [adjustMode, setAdjustMode] = useState('add');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [skipZero, setSkipZero] = useState(false);

  const [seqStart, setSeqStart] = useState(0);
  const [seqIncrement, setSeqIncrement] = useState(1);
  const [seqOrder, setSeqOrder] = useState('selection');

  const [fixedValue, setFixedValue] = useState('00000000');

  const [shiftDir, setShiftDir] = useState('up');
  const [shiftAmount, setShiftAmount] = useState(1);

  const [previewOpen, setPreviewOpen] = useState(false);

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

  const applyTransform = () => {
    if (!inputsValid) return;
    const newRows = rows.slice();
    const indices = [...selected];
    if (transformType === 'Sequential Fill' && seqOrder === 'key') {
      indices.sort((a, b) => {
        const aVal = parseInt(rows[a].key.split('.')[1], 10);
        const bVal = parseInt(rows[b].key.split('.')[1], 10);
        return aVal - bVal;
      });
    }
    indices.forEach((idx, i) => {
      let { key, value } = newRows[idx];
      if (transformType === 'Adjust Values') {
        if (!(skipZero && newRows[idx].offset === 0)) {
          const val = parseInt(value, 16) || 0;
          const amt = parseInt(adjustAmount, 10) || 0;
          const out = adjustMode === 'add' ? val + amt : val - amt;
          const clamped = Math.max(0, Math.min(0xffffffff, out));
          value = clamped.toString(16).toUpperCase().padStart(8, '0');
        }
      } else if (transformType === 'Sequential Fill') {
        const start = parseInt(seqStart, 10) || 0;
        const inc = parseInt(seqIncrement, 10) || 0;
        const out = start + inc * i;
        const clamped = Math.max(0, Math.min(0xffffffff, out));
        value = clamped.toString(16).toUpperCase().padStart(8, '0');
      } else if (transformType === 'Set Fixed Value') {
        value = fixedValue.toUpperCase();
      } else if (transformType === 'Shift Keys') {
        const shift = parseInt(shiftAmount, 10) || 0;
        const dec = parseInt(key.split('.')[1], 10);
        const newIdx = shiftDir === 'up' ? dec + shift : dec - shift;
        key = `${layerKey}.${String(newIdx).padStart(4, '0')}`;
      }
      const dec = parseInt(key.split('.')[1], 10);
      const hex = parseInt(value, 16);
      const offset = dec - (isNaN(hex) ? 0 : hex);
      newRows[idx] = { key, value, offset };
    });
    setRows(newRows);
  };

  const handleSave = () => {
    onSave(rows.map(r => ({ key: r.key, value: r.value })));
    onClose();
  };

  const { query, matchSet, currentResult } = useSearch() || {};
  const { highlight, currentHighlight } = useHighlightColors();

  const preview = useMemo(() => {
    if (selected.length < 2) return [];
    const indices = [...selected];
    if (transformType === 'Sequential Fill' && seqOrder === 'key') {
      indices.sort((a, b) => {
        const aVal = parseInt(rows[a].key.split('.')[1], 10);
        const bVal = parseInt(rows[b].key.split('.')[1], 10);
        return aVal - bVal;
      });
    }
    const result = [];
    indices.forEach((idx, i) => {
      const row = rows[idx];
      let newKey = row.key;
      let newValue = row.value;
      if (transformType === 'Adjust Values') {
        if (!(skipZero && row.offset === 0)) {
          const val = parseInt(row.value, 16) || 0;
          const amt = parseInt(adjustAmount, 10) || 0;
          const out = adjustMode === 'add' ? val + amt : val - amt;
          const clamped = Math.max(0, Math.min(0xffffffff, out));
          newValue = clamped.toString(16).toUpperCase().padStart(8, '0');
        }
      } else if (transformType === 'Sequential Fill') {
        const start = parseInt(seqStart, 10) || 0;
        const inc = parseInt(seqIncrement, 10) || 0;
        const out = start + inc * i;
        const clamped = Math.max(0, Math.min(0xffffffff, out));
        newValue = clamped.toString(16).toUpperCase().padStart(8, '0');
      } else if (transformType === 'Set Fixed Value') {
        newValue = fixedValue.toUpperCase();
      } else if (transformType === 'Shift Keys') {
        const shift = parseInt(shiftAmount, 10) || 0;
        const dec = parseInt(row.key.split('.')[1], 10);
        const newIdx = shiftDir === 'up' ? dec + shift : dec - shift;
        newKey = `${layerKey}.${String(newIdx).padStart(4, '0')}`;
      }
      const dec = parseInt(newKey.split('.')[1], 10);
      const hex = parseInt(newValue, 16);
      const offset = dec - (isNaN(hex) ? 0 : hex);
      result.push({ old: row, newKey, newValue, newOffset: offset });
    });
    return result;
  }, [selected, rows, transformType, adjustMode, adjustAmount, skipZero, seqStart, seqIncrement, seqOrder, fixedValue, shiftDir, shiftAmount, layerKey]);

  const hasShiftConflict = useMemo(() => {
    if (transformType !== 'Shift Keys' || selected.length < 2) return false;
    const indices = selected;
    const otherKeys = rows
      .filter((_, i) => !indices.includes(i))
      .map(r => r.key);
    const newKeys = indices.map(idx => {
      const dec = parseInt(rows[idx].key.split('.')[1], 10);
      const amt = parseInt(shiftAmount, 10) || 0;
      const newIdx = shiftDir === 'up' ? dec + amt : dec - amt;
      return `${layerKey}.${String(newIdx).padStart(4, '0')}`;
    });
    const dup = new Set();
    for (const k of newKeys) {
      if (dup.has(k) || otherKeys.includes(k)) return true;
      dup.add(k);
    }
    return false;
  }, [transformType, selected, rows, shiftAmount, shiftDir, layerKey]);

  const inputsValid = useMemo(() => {
    if (selected.length < 2) return false;
    if (transformType === 'Adjust Values') {
      return !Number.isNaN(parseInt(adjustAmount, 10));
    }
    if (transformType === 'Sequential Fill') {
      return (
        !Number.isNaN(parseInt(seqStart, 10)) &&
        !Number.isNaN(parseInt(seqIncrement, 10))
      );
    }
    if (transformType === 'Set Fixed Value') {
      return valRegex.test(fixedValue);
    }
    if (transformType === 'Shift Keys') {
      return (
        !Number.isNaN(parseInt(shiftAmount, 10)) &&
        !hasShiftConflict
      );
    }
    return false;
  }, [transformType, adjustAmount, seqStart, seqIncrement, fixedValue, shiftAmount, hasShiftConflict, selected.length]);

  return (
    <Dialog
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
          {rows.map((row, i) => {
            const isMatch = matchSet?.has(row.key);
            const isCurrent = currentResult?.key === row.key;
            return (
              <Paper
                key={i}
                onClick={e => handleRowClick(i, e)}
                sx={{
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0,
                  minHeight: 0,
                  borderRadius: 1,
                  bgcolor: selected.includes(i) ? 'action.selected' : undefined,
                  transition: 'background-color 0.3s',
                  '&:hover': { bgcolor: 'action.hover' },
                  ...(isMatch && { bgcolor: highlight }),
                  ...(query && !isMatch && { opacity: 0.7 }),
                  ...(isCurrent && { bgcolor: currentHighlight }),
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
          })}
        </Box>
        <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

          <Box sx={{ mt: 2, p: 1, border: 1, borderColor: selected.length >= 2 ? 'primary.main' : 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {`Transform Selected Entries (${selected.length} selected)`}
              <Tooltip title="Apply batch changes to the selected entries">
                <InfoOutlinedIcon fontSize="small" />
              </Tooltip>
            </Typography>
            <Collapse in={selected.length >= 2}>
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="tt-label">Transformation Type</InputLabel>
                <Select
                  labelId="tt-label"
                  value={transformType}
                  label="Transformation Type"
                  onChange={e => setTransformType(e.target.value)}
                >
                  <MenuItem value="Adjust Values">Adjust Values - Add or subtract from hex values</MenuItem>
                  <MenuItem value="Sequential Fill">Sequential Fill - Auto-number entries</MenuItem>
                  <MenuItem value="Set Fixed Value">Set Fixed Value - Apply same value</MenuItem>
                  <MenuItem value="Shift Keys">Shift Keys - Renumber the key indices</MenuItem>
                </Select>
              </FormControl>

              {transformType === 'Adjust Values' && (
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
                    label="Amount"
                    type="number"
                    size="small"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                    helperText={`= 0x${(parseInt(adjustAmount, 10) || 0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(8, '0')}`}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={skipZero}
                        onChange={e => setSkipZero(e.target.checked)}
                      />
                    }
                    label="Skip entries with zero offset"
                  />
                </Box>
              )}

              {transformType === 'Sequential Fill' && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="Starting value"
                    type="number"
                    size="small"
                    value={seqStart}
                    onChange={e => setSeqStart(e.target.value)}
                    helperText={`= 0x${(parseInt(seqStart, 10) || 0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(8, '0')}`}
                    InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                  />
                  <TextField
                    label="Increment"
                    type="number"
                    size="small"
                    value={seqIncrement}
                    onChange={e => setSeqIncrement(e.target.value)}
                    helperText={`= 0x${(parseInt(seqIncrement, 10) || 0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(8, '0')}`}
                    InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel id="order-label">Order</InputLabel>
                    <Select
                      labelId="order-label"
                      value={seqOrder}
                      label="Order"
                      onChange={e => setSeqOrder(e.target.value)}
                    >
                      <MenuItem value="selection">By selection order</MenuItem>
                      <MenuItem value="key">By key order</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {transformType === 'Set Fixed Value' && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="Hex Value"
                    value={fixedValue}
                    onChange={e => setFixedValue(e.target.value.toUpperCase())}
                    size="small"
                    error={!valRegex.test(fixedValue)}
                    helperText="8-digit hex value"
                    InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => setFixedValue('00000000')}>
                      All zeros
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setFixedValue('FFFFFFFF')}>
                      All F's
                    </Button>
                  </Box>
                </Box>
              )}

              {transformType === 'Shift Keys' && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <RadioGroup
                    row
                    value={shiftDir}
                    onChange={e => setShiftDir(e.target.value)}
                  >
                    <FormControlLabel value="up" control={<Radio />} label="Shift up" />
                    <FormControlLabel value="down" control={<Radio />} label="Shift down" />
                  </RadioGroup>
                  <TextField
                    label="Amount"
                    type="number"
                    size="small"
                    value={shiftAmount}
                    onChange={e => setShiftAmount(e.target.value)}
                    InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
                  />
                  {hasShiftConflict && (
                    <Typography variant="caption" color="error.main">
                      Key conflict detected
                    </Typography>
                  )}
                </Box>
              )}

              <Accordion sx={{ mt: 1 }} expanded={previewOpen} onChange={() => setPreviewOpen(!previewOpen)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Preview Changes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {preview.slice(0, 5).map((p, i) => {
                    const diff = Math.abs(p.newOffset) - Math.abs(p.old.offset);
                    const color = diff < 0 ? 'success.main' : diff > 0 ? 'warning.main' : 'text.primary';
                    return (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", monospace', color }}>
                        <Box>{p.old.key}</Box>
                        <Box>{p.old.value} → {p.newValue}</Box>
                      </Box>
                    );
                  })}
                  {preview.length > 5 && (
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      {`... and ${preview.length - 5} more entries`}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={!inputsValid}
                onClick={applyTransform}
              >
                {`Apply to ${selected.length} entries`}
              </Button>
            </Collapse>
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
