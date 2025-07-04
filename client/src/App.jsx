import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Snackbar,
  Container,
  Tabs,
  Tab,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { openFile, exportFile } from './FileAgent.js';
import { parseIni, stringifyIni } from './ParserAgent.js';
import { listLayers, updateLayer, addLayer, removeLayer } from './LayersAgent.js';
import { loadState, saveState, clearState } from './StorageAgent.js';
import { groupTargetsByLayer } from './TargetsAgent.js';
import { groupSourcesByLayer } from './SourcesAgent.js';

function LayerTabs({ layers, selected, onSelect, onAdd }) {
  if (!layers || layers.length === 0) return null;
  return (
    <Tabs
      orientation="vertical"
      value={layers.findIndex(l => l.key === selected)}
      onChange={(e, idx) => onSelect(layers[idx].key)}
      variant="scrollable"
      sx={{ borderRight: 1, borderColor: 'divider', minWidth: 120, '& .MuiTab-root': { alignItems: 'flex-start' }, '& .MuiTabs-indicator': { width: 4 } }}
    >
      {layers.map(layer => (
        <Tab key={layer.key} label={layer.key} sx={{ transition: 'background-color 0.3s', '&.Mui-selected': { bgcolor: 'action.selected' } }} />
      ))}
      <Tab label="+" onClick={onAdd} sx={{ fontWeight: 'bold' }} />
    </Tabs>
  );
}

function LayerPanel({ layer, targets, sources, onPathChange, onRemove }) {
  if (!layer) return null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div">
            Layer {layer.key}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={layer.value}
            onChange={e => onPathChange(layer.key, e.target.value)}
            label="Path"
          />
          {onRemove && (
            <Button color="error" onClick={() => onRemove(layer.key)}>
              Delete
            </Button>
          )}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Targets
        </Typography>
        <List dense disablePadding>
          {targets.map(t => (
            <ListItem key={t.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
              <ListItemText
                primary={<span className="mono">{t.key} = {t.value}</span>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Sources
        </Typography>
        <List dense disablePadding>
          {sources.map(s => (
            <ListItem key={s.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
              <ListItemText
                primary={<span className="mono">{s.key} = {s.value}</span>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default function App({ mode, toggleMode }) {
  const [iniData, setIniData] = useState(null);
  const [layers, setLayers] = useState([]);
  const [targets, setTargets] = useState({});
  const [sources, setSources] = useState({});
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [fileName, setFileName] = useState('mappingfile.ini');
  const [newline, setNewline] = useState('\n');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      try {
        const parsed = parseIni(saved.text);
        setIniData(parsed);
        const layerList = listLayers(parsed);
        setLayers(layerList);
        setTargets(groupTargetsByLayer(parsed));
        setSources(groupSourcesByLayer(parsed));
        setSelectedLayer(layerList[0]?.key || null);
        setFileName(saved.fileName || 'mappingfile.ini');
        setNewline(saved.newline || '\n');
        setStatus('Restored previous session');
      } catch (err) {
        console.error(err);
        clearState();
      }
    }
  }, []);

  useEffect(() => {
    if (iniData) {
      const text = stringifyIni(iniData, newline);
      saveState({ text, fileName, newline });
    } else {
      clearState();
    }
  }, [iniData, fileName, newline]);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { text, newline } = await openFile(file);
      const parsed = parseIni(text);
      setIniData(parsed);
      const layerList = listLayers(parsed);
      setLayers(layerList);
      setTargets(groupTargetsByLayer(parsed));
      setSources(groupSourcesByLayer(parsed));
      setSelectedLayer(layerList[0]?.key || null);
      setFileName(file.name);
      setNewline(newline);
      setStatus(`Loaded ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to read file');
    }
  };

  const download = () => {
    if (!iniData) return;
    const text = stringifyIni(iniData, newline);
    exportFile(text, fileName);
  };

  const handlePathChange = (key, value) => {
    const index = layers.findIndex(l => l.key === key);
    if (index === -1) return;
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    updateLayer(dataCopy, index, key, value);
    setIniData(dataCopy);
    setLayers(listLayers(dataCopy));
  };

  const handleAddLayer = () => {
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    const newKey = addLayer(dataCopy);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    setSelectedLayer(newKey);
  };

  const handleRemoveLayer = key => {
    const dataCopy = { ...iniData, Layers: { ...iniData.Layers } };
    removeLayer(dataCopy, key);
    setIniData(dataCopy);
    const updated = listLayers(dataCopy);
    setLayers(updated);
    setTargets(groupTargetsByLayer(dataCopy));
    setSources(groupSourcesByLayer(dataCopy));
    setSelectedLayer(updated[0]?.key || null);
  };

  const reset = () => {
    setIniData(null);
    setLayers([]);
    setTargets({});
    setSources({});
    setSelectedLayer(null);
    setFileName('mappingfile.ini');
    setNewline('\n');
    setStatus('');
    clearState();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg,#283593,#8e24aa)', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, minHeight: 64 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mappy INI Editor
          </Typography>
          <input
            type="file"
            accept=".ini"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span">
              Open
            </Button>
          </label>
          <Button variant="contained" onClick={download} disabled={!iniData}>
            Download
          </Button>
          <Button color="inherit" onClick={reset}>
            Reset
          </Button>
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      {iniData ? (
        <Container maxWidth="md" sx={{ flex: 1, display: 'flex', overflow: 'hidden', py: 3 }}>
          <LayerTabs
            layers={layers}
            selected={selectedLayer}
            onSelect={setSelectedLayer}
            onAdd={handleAddLayer}
          />
          <Box sx={{ flex: 1, overflow: 'auto', pl: 3 }}>
            <LayerPanel
              layer={layers.find(l => l.key === selectedLayer)}
              targets={targets[selectedLayer] || []}
              sources={sources[selectedLayer] || []}
              onPathChange={handlePathChange}
              onRemove={handleRemoveLayer}
            />
          </Box>
        </Container>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5" color="text.secondary" sx={{ textAlign: 'center' }}>
            Upload an INI file to get started
          </Typography>
        </Box>
      )}
      <Snackbar
        open={Boolean(status)}
        onClose={() => setStatus('')}
        autoHideDuration={3000}
        message={status}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
