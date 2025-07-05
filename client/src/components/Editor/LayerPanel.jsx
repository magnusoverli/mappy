import { Box } from '@mui/material';
import { memo } from 'react';
import EntryList from '../Common/EntryList.jsx';

const LayerPanel = ({ targets, sources }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <EntryList title="Targets" items={targets} />
      <EntryList title="Sources" items={sources} />
    </Box>
  );
};

export default memo(LayerPanel);

