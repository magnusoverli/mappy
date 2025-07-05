import { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import VirtualizedList from '../Common/VirtualizedList.jsx';

function calcOffset(key, value) {
  const dec = parseInt(key.split('.')[1], 10);
  const hex = parseInt(value, 16);
  return dec - hex;
}

export default function EntryEditorModal({
  open,
  onClose,
  title,
  entries = [],
  onSave,
  layer,
}) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const lastIndex = useRef(null);

  useEffect(() => {
    if (open) {
      setRows(entries.map(e => ({ ...e })));
      setSelected([]);
      lastIndex.current = null;
    }
  }, [open, entries]);

  const handleRowClick = (index, e) => {
    if (e.shiftKey && lastIndex.current !== null) {
      const start = Math.min(lastIndex.current, index);
      const end = Math.max(lastIndex.current, index);
      const sel = [];
      for (let i = start; i <= end; i++) sel.push(i);
      setSelected(sel);
    } else {
      setSelected([index]);
      lastIndex.current = index;
    }
  };

  const handleChange = (index, field, value) => {
    setRows(r => {
      const copy = [...r];
      copy[index] = { ...copy[index], [field]: value };
      copy[index].offset = calcOffset(copy[index].key, copy[index].value);
      return copy;
    });
  };

  const handleDelete = () => {
    setRows(r => r.filter((_, i) => !selected.includes(i)));
    setSelected([]);
  };

  const [batchQty, setBatchQty] = useState(1);
  const [batchStart, setBatchStart] = useState('');
  const [batchOffset, setBatchOffset] = useState(0);

  useEffect(() => {
    if (open) {
      const last = entries[entries.length - 1];
      const lastIndexVal = last ? parseInt(last.key.split('.')[1], 10) : -1;
      setBatchStart(String(lastIndexVal + 1).padStart(4, '0'));
      setBatchOffset(last ? last.offset : 0);
    }
  }, [open, entries]);

  const handleAddBatch = () => {
    const start = parseInt(batchStart, 10);
    const qty = parseInt(batchQty, 10);
    const off = parseInt(batchOffset, 10);
    const newRows = [];
    for (let i = 0; i < qty; i++) {
      const index = start + i;
      const key = `${layer}.${index.toString().padStart(4, '0')}`;
      const valHex = (index - off).toString(16).padStart(8, '0');
      newRows.push({ key, value: valHex, offset: off });
    }
    setRows(r => [...r, ...newRows]);
  };

  const save = () => {
    onSave && onSave(rows);
    onClose && onClose();
  };

  const renderRow = (row, i, style) => (
    <Box
      style={style}
      key={i}
      onClick={e => handleRowClick(i, e)}
      sx={{
        display: 'flex',
        px: 1,
        alignItems: 'center',
        bgcolor: selected.includes(i) ? 'action.selected' : undefined,
      }}
    >
      <Box sx={{ width: '40%' }}>
        <TextField
          variant="standard"
          value={row.key}
          fullWidth
          onChange={e => handleChange(i, 'key', e.target.value)}
          onClick={e => e.stopPropagation()}
          InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
        />
      </Box>
      <Box sx={{ width: '40%' }}>
        <TextField
          variant="standard"
          value={row.value}
          fullWidth
          onChange={e => handleChange(i, 'value', e.target.value)}
          onClick={e => e.stopPropagation()}
          InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
        />
      </Box>
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
    </Box>
  );

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
          <Button color="inherit" startIcon={<SaveIcon />} onClick={save}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', height: '100%' }}>
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <VirtualizedList items={rows} itemHeight={48} renderRow={renderRow} />
          </Box>
        </Box>
        <Box
          sx={{
            width: 280,
            p: 2,
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1">Add Entries</Typography>
            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={batchQty}
              onChange={e => setBatchQty(e.target.value)}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Start Index"
              size="small"
              value={batchStart}
              onChange={e => setBatchStart(e.target.value)}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Offset"
              size="small"
              value={batchOffset}
              onChange={e => setBatchOffset(e.target.value)}
              sx={{ mt: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBatch}
              sx={{ mt: 1 }}
            >
              Add
            </Button>
          </Paper>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={selected.length === 0}
          >
            Delete Selected
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
