import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function EntriesModal({ open, onClose, entries = [], title, onSave }) {
  const [rows, setRows] = useState(() => entries.map((e, idx) => ({ id: idx, ...e })));

  const columns = [
    { field: 'key', headerName: 'Key', flex: 1, editable: true },
    { field: 'value', headerName: 'Value', flex: 1, editable: true },
    { field: 'offset', headerName: 'Offset', flex: 1, editable: false },
  ];

  const handleProcessRowUpdate = newRow => {
    const keyMatch = /^\d{2}\.\d{4}$/.test(newRow.key);
    const valMatch = /^[0-9A-Fa-f]{8}$/.test(newRow.value);
    const dec = parseInt(newRow.key.split('.')[1], 10);
    const hex = parseInt(newRow.value, 16);
    newRow.offset = dec - hex;
    if (!keyMatch || !valMatch) newRow.isValid = false; else newRow.isValid = true;
    const updatedRows = rows.map(r => (r.id === newRow.id ? newRow : r));
    setRows(updatedRows);
    return newRow;
  };

  const handleSave = () => {
    const valid = rows.every(r => r.isValid !== false);
    if (!valid) return;
    onSave &&
      onSave(rows.map(r => ({ key: r.key, value: r.value, offset: r.offset })));
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: '80vh', width: '100%' }}>
          <DataGrid
            columns={columns}
            rows={rows}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={handleProcessRowUpdate}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
