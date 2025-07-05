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
import { useEffect, useState } from 'react';
import AppToolbar from '../Layout/AppToolbar.jsx';

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

  const handleSave = () => {
    onSave(rows.map(r => ({ key: r.key, value: r.value })));
    onClose();
  };

  const keyRegex = /^\d{2}\.\d{4}$/;
  const valRegex = /^[0-9A-Fa-f]{8}$/;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { display: 'flex', flexDirection: 'column' } }}
    >
      <AppToolbar position="relative">
        <Typography
          variant="h4"
          component="div"
          sx={{ fontFamily: '"Baloo 2", sans-serif', fontWeight: 'bold', mr: 2 }}
        >
          Mappy
        </Typography>
        <Typography
          sx={{ flex: 1, fontFamily: '"Baloo 2", sans-serif', fontWeight: 'bold' }}
          variant="h6"
          component="div"
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
          {rows.map((row, i) => (
            <Paper
              key={i}
              onClick={e => handleRowClick(i, e)}
              sx={{
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                bgcolor: selected.includes(i) ? 'action.selected' : undefined,
              }}
            >
              <TextField
                value={row.key}
                onChange={e => handleCellChange(i, 'key', e.target.value)}
                variant="standard"
                error={!keyRegex.test(row.key)}
                sx={{ width: '40%' }}
                InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
              />
              <TextField
                value={row.value}
                onChange={e => handleCellChange(i, 'value', e.target.value)}
                variant="standard"
                error={!valRegex.test(row.value)}
                sx={{ width: '40%' }}
                InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
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
          ))}
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
