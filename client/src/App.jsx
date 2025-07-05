import { Box, Container, Snackbar, Typography } from '@mui/material';
import LayerPanel from './components/Editor/LayerPanel.jsx';
import LayerPathRow from './components/Editor/LayerPathRow.jsx';
import Header from './components/Layout/Header.jsx';
import { SearchProvider } from './hooks/useSearch.js';
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
    saveTargets,
    saveSources,
    reset,
  } = useMappingEditor();

  return (
    <SearchProvider
      layers={layers}
      targets={targets}
      sources={sources}
      selectedLayer={selectedLayer}
      setSelectedLayer={setSelectedLayer}
    >
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
            gridTemplateRows: 'auto 1fr',
            gridTemplateAreas: `"path" "lists"`,
          }}
        >
          <Box sx={{ gridArea: 'path', mb: 2 }}>
            <LayerPathRow
              layer={layers.find(l => l.key === selectedLayer)}
              onPathChange={handlePathChange}
              onAdd={handleAddLayer}
            />
          </Box>
          <Box sx={{ gridArea: 'lists', overflow: 'auto' }}>
            <LayerPanel
              layers={layers}
              targets={targets[selectedLayer] || []}
              sources={sources[selectedLayer] || []}
              selectedLayer={selectedLayer}
              onSelectLayer={setSelectedLayer}
              onDeleteLayer={handleRemoveLayer}
              onError={setStatus}
              onSaveTargets={saveTargets}
              onSaveSources={saveSources}
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
    </SearchProvider>
  );
}
