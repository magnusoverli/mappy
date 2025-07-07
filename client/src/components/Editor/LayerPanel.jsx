import { Box, Button } from '@mui/material';
import { memo } from 'react';
import { useSearch } from '../../hooks/useSearch.jsx';
import DataTable from '../Common/DataTable.jsx';
import LayerSelector from './LayerSelector.jsx';

const LayerPanel = ({
  layers,
  targets,
  sources,
  selectedLayer,
  onSelectLayer,
}) => {
  const { query, counts } = useSearch() || {};
  const active = Boolean(query);

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
              onClick={() => {}}
              disabled={false}
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
              onClick={() => {}}
              disabled={false}
            >
              Edit
            </Button>
          </Box>
        }
        items={sources}
      />

    </Box>
  );
};

export default memo(LayerPanel);

