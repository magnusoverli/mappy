import { Box, Container, Snackbar, Typography } from '@mui/material';
import LayerTabs from './components/Editor/LayerTabs.jsx';
import LayerPanel from './components/Editor/LayerPanel.jsx';
import LayerPathRow from './components/Editor/LayerPathRow.jsx';
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
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            flex: 1,
            display: 'grid',
            overflow: 'hidden',
            py: 3,
            gridTemplateColumns: 'max-content 1fr',
            gridTemplateRows: 'auto 1fr',
            gridTemplateAreas: `"path path" "tabs panel"`,
          }}
        >
          <Box sx={{ gridArea: 'path', mb: 2 }}>
            <LayerPathRow
              layer={layers.find(l => l.key === selectedLayer)}
              onPathChange={handlePathChange}
              onRemove={handleRemoveLayer}
            />
          </Box>
          <Box sx={{ gridArea: 'tabs', pr: 2 }}>
            <LayerTabs
              layers={layers}
              selected={selectedLayer}
              onSelect={setSelectedLayer}
              onAdd={handleAddLayer}
            />
          </Box>
          <Box sx={{ gridArea: 'panel', overflow: 'auto' }}>
            <LayerPanel
              targets={targets[selectedLayer] || []}
              sources={sources[selectedLayer] || []}
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
