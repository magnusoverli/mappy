import { Box } from '@mui/material';
import { memo } from 'react';
import EntryList from '../Common/EntryList.jsx';
import LayerList from './LayerList.jsx';
const LayerPanel = ({
  layers,
  targets,
  sources,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onError,
}) => (
  <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
    <LayerList
      layers={layers}
      selected={selectedLayer}
      onSelect={onSelectLayer}
      onDelete={onDeleteLayer}
      onError={onError}
    />
    <EntryList title="Targets" items={targets} />
    <EntryList title="Sources" items={sources} />
  </Box>
);

export default memo(LayerPanel);

