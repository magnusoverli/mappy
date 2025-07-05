import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';

function computeOffset(key, value) {
  const [, indexPart] = key.split('.');
  const decIndex = parseInt(indexPart, 10);
  const hexVal = parseInt(value, 16);
  return decIndex - hexVal;
}

export default function EntryEditModal({
  open,
  onClose,
  title,
  entries: initial,
  onSave,
}) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setRows(initial.map(e => ({ ...e })));
      setSelected([]);
    }
  }, [open, initial]);

  const handleFieldChange = (idx, field, value) => {
    setRows(r => {
      const copy = [...r];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows(r => [
      ...r,
      { key: '', value: '', offset: 0 },
    ]);
  };

  const handleDelete = () => {
    setRows(r => r.filter((_row, i) => !selected.includes(i)));
    setSelected([]);
  };

  const handleSave = () => {
    const cleaned = rows.map(r => ({
      key: r.key.trim(),
      value: r.value.trim().toUpperCase(),
    }));
    onSave && onSave(cleaned);
  };

  const toggleSelect = idx => {
    setSelected(s =>
      s.includes(idx) ? s.filter(i => i !== idx) : [...s, idx]
    );
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
          <Button color="inherit" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, display: 'flex', height: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="right">Offset</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx} selected={selected.includes(idx)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(idx)}
                      onChange={() => toggleSelect(idx)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <TextField
                      fullWidth
                      variant="standard"
                      value={row.key}
                      onChange={e => handleFieldChange(idx, 'key', e.target.value)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <TextField
                      fullWidth
                      variant="standard"
                      value={row.value}
                      onChange={e => handleFieldChange(idx, 'value', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ width: '20%' }}>
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: computeOffset(row.key, row.value) === 0 ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {computeOffset(row.key, row.value)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ width: 200, pl: 2, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Button startIcon={<AddIcon />} fullWidth onClick={handleAddRow}>
              Add Entry
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              fullWidth
              disabled={selected.length === 0}
              sx={{ mt: 1 }}
              onClick={handleDelete}
            >
              Delete Selected
            </Button>
          </Paper>
        </Box>
      </Box>
    </Dialog>
  );
}
