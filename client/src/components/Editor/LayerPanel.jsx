import { Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import { useSearch } from '../../hooks/useSearch.jsx';
import DataTable from '../Common/DataTable.jsx';
import LayerSelector from './LayerSelector.jsx';
import EntryEditModal from '../EntryEditModal/EntryEditModal.jsx';

const LayerPanel = ({
  layers,
  targets,
  sources,
  selectedLayer,
  onSelectLayer,
  onUpdateEntries,
}) => {
  const { query, counts } = useSearch() || {};
  const active = Boolean(query);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntryType, setModalEntryType] = useState('');

  const currentLayer = layers.find(l => l.key === selectedLayer);
  
  const handleEditTargets = () => {
    setModalEntryType('Targets');
    setModalOpen(true);
  };

  const handleEditSources = () => {
    setModalEntryType('Sources');
    setModalOpen(true);
  };

  const handleModalSave = async (updatedEntries) => {
    if (onUpdateEntries) {
      await onUpdateEntries(selectedLayer, modalEntryType, updatedEntries);
    }
  };

  const getLayerData = () => {
    if (!currentLayer) return null;
    
    return {
      name: currentLayer.value || `Layer ${selectedLayer}`,
      targets: targets || [],
      sources: sources || [],
    };
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <LayerSelector
        layers={layers}
        selected={selectedLayer}
        onSelect={onSelectLayer}
      />
      <DataTable
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {`Targets${active ? ` (${counts?.targets || 0})` : ''}`}
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleEditTargets}
              disabled={!currentLayer}
            >
              Edit
            </Button>
          </Box>
        }
        items={targets}
      />
      <DataTable
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {`Sources${active ? ` (${counts?.sources || 0})` : ''}`}
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleEditSources}
              disabled={!currentLayer}
            >
              Edit
            </Button>
          </Box>
        }
        items={sources}
      />

      <EntryEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        layerData={getLayerData()}
        entryType={modalEntryType}
        onSave={handleModalSave}
      />
    </Box>
  );
};

export default memo(LayerPanel);

