import { Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import EntryList from '../Common/EntryList.jsx';
import LayerList from './LayerList.jsx';
import EntryEditModal from './EntryEditModal.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';
const LayerPanel = ({
  layers,
  targets,
  sources,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onError,
  onSaveTargets,
  onSaveSources,
}) => {
  const [editing, setEditing] = useState(null);

  const currentLayer = layers.find(l => l.key === selectedLayer);

  const handleSave = entries => {
    if (editing === 'targets' && onSaveTargets) {
      onSaveTargets(selectedLayer, entries);
    }
    if (editing === 'sources' && onSaveSources) {
      onSaveSources(selectedLayer, entries);
    }
    setEditing(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        <LayerList
          layers={layers}
          selected={selectedLayer}
          onSelect={onSelectLayer}
          onDelete={onDeleteLayer}
          onError={onError}
        />
        <EntryList
          title="Targets"
          items={targets}
          titleAction={
            <Button size="small" variant="contained" onClick={() => setEditing('targets')}>
              Edit
            </Button>
          }
        />
        <EntryList
          title="Sources"
          items={sources}
          titleAction={
            <Button size="small" variant="contained" onClick={() => setEditing('sources')}>
              Edit
            </Button>
          }
        />
      </Box>
      <EntryEditModal
        open={Boolean(editing)}
        title={
          currentLayer
            ? `${formatLayerLabel(currentLayer.key, currentLayer.value)} - Editing ${
                editing === 'targets' ? 'Targets' : 'Sources'
              }`
            : ''
        }
        entries={editing === 'targets' ? targets : sources}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
};

export default memo(LayerPanel);

