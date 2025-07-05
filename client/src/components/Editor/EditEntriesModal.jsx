import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  IconButton,
  Toolbar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

function calcOffset(key, value) {
  const parts = key.split('.');
  if (parts.length !== 2) return 0;
  const dec = parseInt(parts[1], 10);
  const hex = parseInt(value, 16);
  return dec - hex;
}

export default function EditEntriesModal({
  open,
  onClose,
  type,
  layer,
  layerPath,
  entries = [],
  onSave,
}) {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setRows(entries.map(e => ({ key: e.key, value: e.value })));
    }
  }, [open, entries]);

  const condensedName = useMemo(
    () => formatLayerLabel(layer, layerPath),
    [layer, layerPath],
  );

  const title = `${condensedName} - Editing ${type === 'targets' ? 'Targets' : 'Sources'}`;

  const nextDefaults = useMemo(() => {
    let maxIdx = -1;
    let lastOffset = 0;
    rows.forEach(r => {
      const parts = r.key.split('.');
      const idx = parseInt(parts[1], 10);
      if (idx > maxIdx) {
        maxIdx = idx;
        lastOffset = calcOffset(r.key, r.value);
      }
    });
    const nextIdx = maxIdx + 1;
    const key = `${layer}.${String(nextIdx).padStart(4, '0')}`;
    const val = (nextIdx - lastOffset).toString(16).toUpperCase().padStart(8, '0');
    return { key, val };
  }, [rows, layer]);

  useEffect(() => {
    if (open) {
      setNewKey(nextDefaults.key);
      setNewVal(nextDefaults.val);
      setError('');
    }
  }, [open, nextDefaults]);

  const validate = (k, v) => {
    if (!/^\d{2}\.\d{4}$/.test(k)) return 'Invalid key format';
    if (!/^[0-9A-Fa-f]{8}$/.test(v)) return 'Invalid hex value';
    if (rows.some(r => r.key === k)) return 'Duplicate key';
    return '';
  };

  const handleAdd = () => {
    const err = validate(newKey, newVal);
    if (err) {
      setError(err);
      return;
    }
    setRows([...rows, { key: newKey, value: newVal }]);
    setNewKey(`${layer}.${String(parseInt(newKey.split('.')[1], 10) + 1).padStart(4, '0')}`);
    setNewVal(nextDefaults.val);
    setError('');
  };

  const handleChangeRow = (index, field, value) => {
    const updated = rows.slice();
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleDeleteRow = index => {
    const updated = rows.slice();
    updated.splice(index, 1);
    setRows(updated);
  };

  const filtered = rows.filter(r =>
    r.key.includes(filter) || r.value.includes(filter),
  );

  const handleSave = () => {
    const errs = rows.map(r => validate(r.key, r.value)).filter(Boolean);
    if (errs.length) {
      setError(errs[0]);
      return;
    }
    onSave(rows);
    onClose();
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', height: '100%', p: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Toolbar disableGutters sx={{ mb: 1 }}>
            <TextField
              label="Search"
              size="small"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              sx={{ mr: 2 }}
            />
          </Toolbar>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell align="right">Offset</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell width="30%">
                      <TextField
                        value={row.key}
                        onChange={e => handleChangeRow(i, 'key', e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell width="30%">
                      <TextField
                        value={row.value}
                        onChange={e => handleChangeRow(i, 'value', e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell width="20%" align="right">
                      <Typography fontFamily="'JetBrains Mono', monospace">
                        {calcOffset(row.key, row.value)}
                      </Typography>
                    </TableCell>
                    <TableCell width="20%" align="right">
                      <IconButton onClick={() => handleDeleteRow(i)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
        <Box sx={{ width: 300, p: 2, borderLeft: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Entry
          </Typography>
          <TextField
            label="Key"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 1 }}
          />
          <TextField
            label="Hex Value"
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Offset: {calcOffset(newKey, newVal)}
          </Typography>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            fullWidth
            onClick={handleAdd}
          >
            Add
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ flexGrow: 1, pl: 2 }}>
          <Typography variant="caption">
            {rows.length} entries
          </Typography>
        </Box>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
