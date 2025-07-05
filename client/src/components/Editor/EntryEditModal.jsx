import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Box, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';

const keyRegex = /^\d{2}\.\d{4}$/;
const hexRegex = /^[0-9A-Fa-f]{8}$/;

function calcNextKey(entries, layerKey) {
  const indices = entries.map(e => parseInt(e.key.split('.')[1], 10));
  const max = indices.length ? Math.max(...indices) : -1;
  const next = max + 1;
  return `${layerKey}.${String(next).padStart(4, '0')}`;
}

function calcOffset(index, hex) {
  const dec = parseInt(index, 10);
  const val = parseInt(hex, 16);
  return dec - val;
}

function calcNextHex(entries, layerKey) {
  if (!entries.length) return '00000000';
  const sorted = [...entries].sort((a, b) => parseInt(a.key.split('.')[1], 10) - parseInt(b.key.split('.')[1], 10));
  const last = sorted[sorted.length - 1];
  const lastOffset = calcOffset(last.key.split('.')[1], last.value);
  const nextIndex = parseInt(calcNextKey(entries, layerKey).split('.')[1], 10);
  const nextVal = (nextIndex - lastOffset).toString(16).toUpperCase().padStart(8, '0');
  return nextVal;
}

export default function EntryEditModal({ open, onClose, layerKey, layerLabel, entries = [], onSave, type }) {
  const [rows, setRows] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newHex, setNewHex] = useState('');

  useEffect(() => {
    if (open) {
      const copy = entries.map(e => ({ ...e }));
      setRows(copy);
      setNewKey(calcNextKey(copy, layerKey));
      setNewHex(calcNextHex(copy, layerKey));
    }
  }, [open, entries, layerKey]);

  const handleRowChange = (idx, field, value) => {
    const updated = rows.slice();
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'key' || field === 'value') {
      const indexPart = updated[idx].key.split('.')[1] || '0';
      const hex = updated[idx].value || '0';
      updated[idx].offset = calcOffset(indexPart, hex);
    }
    setRows(updated);
  };

  const handleDeleteRow = idx => {
    const updated = rows.slice();
    updated.splice(idx, 1);
    setRows(updated);
  };

  const handleAdd = () => {
    if (!keyRegex.test(newKey) || !hexRegex.test(newHex)) return;
    if (rows.some(r => r.key === newKey)) return;
    const indexPart = newKey.split('.')[1];
    const offset = calcOffset(indexPart, newHex);
    const updated = [...rows, { key: newKey, value: newHex.toUpperCase(), offset }];
    setRows(updated);
    const next = calcNextKey(updated, layerKey);
    setNewKey(next);
    setNewHex(calcNextHex(updated, layerKey));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(rows.map(r => ({ key: r.key, value: r.value })));
    }
    onClose();
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {layerLabel} - Editing {type}
          </Typography>
          <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ textAlign: 'left', px: 1 }}>Key</Box>
              <Box component="th" sx={{ textAlign: 'left', px: 1 }}>Value</Box>
              <Box component="th" sx={{ textAlign: 'right', px: 1 }}>Offset</Box>
              <Box component="th" />
            </Box>
          </Box>
          <Box component="tbody">
            {rows.map((row, idx) => (
              <Box component="tr" key={idx}>
                <Box component="td" sx={{ px: 1 }}>
                  <TextField
                    size="small"
                    value={row.key}
                    error={!keyRegex.test(row.key)}
                    onChange={e => handleRowChange(idx, 'key', e.target.value)}
                  />
                </Box>
                <Box component="td" sx={{ px: 1 }}>
                  <TextField
                    size="small"
                    value={row.value}
                    error={!hexRegex.test(row.value)}
                    onChange={e => handleRowChange(idx, 'value', e.target.value.toUpperCase())}
                  />
                </Box>
                <Box component="td" sx={{ textAlign: 'right', px: 1, fontFamily: '"JetBrains Mono", monospace' }}>
                  {row.offset}
                </Box>
                <Box component="td" sx={{ px: 1 }}>
                  <IconButton onClick={() => handleDeleteRow(idx)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Key"
            size="small"
            value={newKey}
            error={!keyRegex.test(newKey) || rows.some(r => r.key === newKey)}
            onChange={e => setNewKey(e.target.value)}
          />
          <TextField
            label="Hex"
            size="small"
            value={newHex}
            error={!hexRegex.test(newHex)}
            onChange={e => setNewHex(e.target.value.toUpperCase())}
          />
          <Typography sx={{ minWidth: 80, fontFamily: '"JetBrains Mono", monospace' }}>
            {hexRegex.test(newHex) && keyRegex.test(newKey)
              ? calcOffset(newKey.split('.')[1], newHex)
              : ''}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Entry
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
