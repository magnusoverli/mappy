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
  onEditTargets,
  onEditSources,
}) => {
  const [editType, setEditType] = useState(null);

  const layer = layers.find(l => l.key === selectedLayer);

  const handleClose = () => setEditType(null);

  const openTargets = () => {
    setEditType('Targets');
  };
  const openSources = () => {
    setEditType('Sources');
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
          titleAction={<Button onClick={openTargets}>Edit</Button>}
        />
        <EntryList
          title="Sources"
          items={sources}
          titleAction={<Button onClick={openSources}>Edit</Button>}
        />
      </Box>
      {editType && layer && (
        <EntryEditModal
          open
          type={editType}
          layerKey={layer.key}
          layerLabel={formatLayerLabel(layer.key, layer.value)}
          entries={editType === 'Targets' ? targets : sources}
          onClose={handleClose}
          onSave={entries => {
            if (editType === 'Targets') {
              onEditTargets && onEditTargets(entries);
            } else {
              onEditSources && onEditSources(entries);
            }
            handleClose();
          }}
        />
      )}
    </>
  );
};

export default memo(LayerPanel);

