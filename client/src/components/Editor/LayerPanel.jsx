import { Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import { useSearch } from '../../hooks/useSearch.jsx';
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
  const [editTargetsOpen, setEditTargetsOpen] = useState(false);
  const [editSourcesOpen, setEditSourcesOpen] = useState(false);

  const layer = layers.find(l => l.key === selectedLayer);
  const label = layer ? formatLayerLabel(layer.key, layer.value) : '';
  const { query, counts } = useSearch() || {};
  const active = Boolean(query);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <LayerList
        layers={layers}
        selected={selectedLayer}
        onSelect={onSelectLayer}
        onDelete={onDeleteLayer}
        onError={onError}
      />
      <EntryList
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {`Targets${active ? ` (${counts?.targets || 0})` : ''}`}
            <Button variant="contained" size="small" onClick={() => setEditTargetsOpen(true)}>
              Edit
            </Button>
          </Box>
        }
        items={targets}
      />
      <EntryList
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {`Sources${active ? ` (${counts?.sources || 0})` : ''}`}
            <Button variant="contained" size="small" onClick={() => setEditSourcesOpen(true)}>
              Edit
            </Button>
          </Box>
        }
        items={sources}
      />
      <EntryEditModal
        open={editTargetsOpen}
        onClose={() => setEditTargetsOpen(false)}
        onSave={entries => onSaveTargets(selectedLayer, entries)}
        entries={targets}
        layerLabel={label}
        layerKey={selectedLayer}
        type="Targets"
      />
      <EntryEditModal
        open={editSourcesOpen}
        onClose={() => setEditSourcesOpen(false)}
        onSave={entries => onSaveSources(selectedLayer, entries)}
        entries={sources}
        layerLabel={label}
        layerKey={selectedLayer}
        type="Sources"
      />
    </Box>
  );
};

export default memo(LayerPanel);

