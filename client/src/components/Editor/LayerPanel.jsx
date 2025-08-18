import { Box, Button } from '@mui/material';
import { memo, useState, useRef, useEffect } from 'react';
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
  const { query, counts, matchSet, currentResult } = useSearch() || {};
  const active = Boolean(query);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntryType, setModalEntryType] = useState('');
  const targetsListRef = useRef(null);
  const sourcesListRef = useRef(null);

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

  // Auto-scroll to first match when search results change or when navigating results
  useEffect(() => {
    if (!query) return;
    
    // Use a small timeout to ensure the list has rendered before scrolling
    const scrollTimeout = setTimeout(() => {
      // If there's a current result (from navigation), scroll to it
      if (currentResult && currentResult.layerKey === selectedLayer) {
        const targetIndex = targets.findIndex(item => item.key === currentResult.key);
        const sourceIndex = sources.findIndex(item => item.key === currentResult.key);
        
        if (targetIndex !== -1 && targetsListRef.current) {
          targetsListRef.current.scrollToItem(targetIndex, 'center');
        }
        if (sourceIndex !== -1 && sourcesListRef.current) {
          sourcesListRef.current.scrollToItem(sourceIndex, 'center');
        }
      } 
      // Otherwise, scroll to first match in each list
      else if (matchSet && matchSet.size > 0) {
        // Find first matching target index
        const firstTargetMatch = targets.findIndex(item => matchSet.has(item.key));
        if (firstTargetMatch !== -1 && targetsListRef.current) {
          targetsListRef.current.scrollToItem(firstTargetMatch, 'start');
        }
        
        // Find first matching source index
        const firstSourceMatch = sources.findIndex(item => matchSet.has(item.key));
        if (firstSourceMatch !== -1 && sourcesListRef.current) {
          sourcesListRef.current.scrollToItem(firstSourceMatch, 'start');
        }
      }
    }, 50); // Small delay to ensure smooth scrolling
    
    return () => clearTimeout(scrollTimeout);
  }, [query, matchSet, currentResult, targets, sources, selectedLayer]);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <LayerSelector
        layers={layers}
        selected={selectedLayer}
        onSelect={onSelectLayer}
      />
      <DataTable
        ref={targetsListRef}
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
        ref={sourcesListRef}
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

