import { Box, Button } from '@mui/material';
import { memo, useState } from 'react';
import EntryList from '../Common/EntryList.jsx';
import LayerList from './LayerList.jsx';
import EntriesModal from './EntriesModal.jsx';
const LayerPanel = ({
  layers,
  targets,
  sources,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onError,
  onTargetsSave,
  onSourcesSave,
}) => {
  const [editTargets, setEditTargets] = useState(false);
  const [editSources, setEditSources] = useState(false);

  const targetFooter = (
    <Button variant="contained" onClick={() => setEditTargets(true)}>Edit</Button>
  );
  const sourceFooter = (
    <Button variant="contained" onClick={() => setEditSources(true)}>Edit</Button>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <LayerList
        layers={layers}
        selected={selectedLayer}
        onSelect={onSelectLayer}
        onDelete={onDeleteLayer}
        onError={onError}
      />
      <EntryList title="Targets" items={targets} footer={targetFooter} />
      <EntryList title="Sources" items={sources} footer={sourceFooter} />
      <EntriesModal
        open={editTargets}
        onClose={() => setEditTargets(false)}
        title="Edit Targets"
        entries={targets}
        onSave={data => {
          onTargetsSave && onTargetsSave(data);
          setEditTargets(false);
        }}
      />
      <EntriesModal
        open={editSources}
        onClose={() => setEditSources(false)}
        title="Edit Sources"
        entries={sources}
        onSave={data => {
          onSourcesSave && onSourcesSave(data);
          setEditSources(false);
        }}
      />
    </Box>
  );
};

export default memo(LayerPanel);

