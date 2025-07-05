import { Box, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { memo, useState } from 'react';
import EntryList from '../Common/EntryList.jsx';
import LayerList from './LayerList.jsx';
import EntryEditorModal from './EntryEditorModal.jsx';

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
  const [editTargets, setEditTargets] = useState(false);
  const [editSources, setEditSources] = useState(false);

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
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditTargets(true)}
            >
              Edit
            </Button>
          }
        />
        <EntryList
          title="Sources"
          items={sources}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditSources(true)}
            >
              Edit
            </Button>
          }
        />
      </Box>
      <EntryEditorModal
        open={editTargets}
        onClose={() => setEditTargets(false)}
        title={`${selectedLayer} - Editing Targets`}
        entries={targets}
        onSave={rows => onSaveTargets && onSaveTargets(selectedLayer, rows)}
        layer={selectedLayer}
      />
      <EntryEditorModal
        open={editSources}
        onClose={() => setEditSources(false)}
        title={`${selectedLayer} - Editing Sources`}
        entries={sources}
        onSave={rows => onSaveSources && onSaveSources(selectedLayer, rows)}
        layer={selectedLayer}
      />
    </>
  );
};

export default memo(LayerPanel);

