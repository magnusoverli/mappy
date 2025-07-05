import { Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import EntryList from '../Common/EntryList.jsx';
import LayerList from './LayerList.jsx';
import EditEntriesModal from './EditEntriesModal.jsx';
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
  const [editType, setEditType] = useState(null);

  const layerInfo = layers.find(l => l.key === selectedLayer) || {};

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
          footer={
            <Button size="small" onClick={() => setEditType('targets')}>
              Edit
            </Button>
          }
        />
        <EntryList
          title="Sources"
          items={sources}
          footer={
            <Button size="small" onClick={() => setEditType('sources')}>
              Edit
            </Button>
          }
        />
      </Box>
      {editType && (
        <EditEntriesModal
          open
          type={editType}
          layer={selectedLayer}
          layerPath={layerInfo.value}
          entries={editType === 'targets' ? targets : sources}
          onClose={() => setEditType(null)}
          onSave={rows => {
            if (editType === 'targets') onSaveTargets && onSaveTargets(rows);
            else onSaveSources && onSaveSources(rows);
          }}
        />
      )}
    </>
  );
};

export default memo(LayerPanel);

