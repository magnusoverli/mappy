import { Box, Container, Snackbar, Typography } from '@mui/material';
import LayerTabs from './components/Editor/LayerTabs.jsx';
import LayerPanel from './components/Editor/LayerPanel.jsx';
import Header from './components/Layout/Header.jsx';
import useMappingEditor from './hooks/useMappingEditor.js';

export default function App({ mode, toggleMode }) {
  const {
    iniData,
    layers,
    targets,
    sources,
    selectedLayer,
    status,
    loading,
    setStatus,
    setSelectedLayer,
    handleFileChange,
    download,
    handlePathChange,
    handleAddLayer,
    handleRemoveLayer,
    reset,
  } = useMappingEditor();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        mode={mode}
        toggleMode={toggleMode}
        iniData={iniData}
        onFileSelect={handleFileChange}
        onDownload={download}
        onReset={reset}
        loading={loading}
      />
      {iniData ? (
        <Container maxWidth={false} disableGutters sx={{ flex: 1, display: 'flex', overflow: 'hidden', py: 3 }}>
          <LayerTabs
            layers={layers}
            selected={selectedLayer}
            onSelect={setSelectedLayer}
            onAdd={handleAddLayer}
          />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
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
            Upload a mapping file to get started
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
