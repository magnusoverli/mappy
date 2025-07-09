import { Box, Typography } from '@mui/material';
import DataTable from '../../Common/DataTable.jsx';
import SelectableDataRow from './SelectableDataRow.jsx';
import { SPACING, FONTS } from '../../../utils/styleConstants.js';

function SelectableHeader() {
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        px: SPACING.PADDING.MEDIUM, 
        fontWeight: 'bold', 
        fontFamily: FONTS.MONOSPACE,
        alignItems: 'center',
      }}>
        <Box sx={{ width: '5%' }}></Box> {/* Selection column */}
        <Box sx={{ width: '35%' }}>Key</Box>
        <Box sx={{ width: '35%' }}>Value</Box>
        <Box sx={{ width: '25%', textAlign: 'right' }}>Offset</Box>
      </Box>
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block',
          px: SPACING.PADDING.MEDIUM,
          pt: 1,
          color: 'text.secondary',
          fontSize: '0.75rem',
        }}
      >
        Click to select • Ctrl+click to toggle • Shift+click to select range
      </Typography>
    </Box>
  );
}

export default function DataPanel({ 
  entries, 
  selectedItems, 
  onSelection
}) {
  const handleRowSelection = (item, index, event) => {
    onSelection(item, index, event, entries);
  };

  const renderSelectableRow = (item, index, style) => (
    <SelectableDataRow
      item={item}
      style={style}
      isSelected={selectedItems.has(item.key)}
      onSelection={handleRowSelection}
      index={index}
    />
  );

  if (entries.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No entries to edit
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add some entries using the controls on the right to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <DataTable
        items={entries}
        renderRow={renderSelectableRow}
        header={<SelectableHeader />}
        itemHeight={40}
        paperProps={{
          sx: {
            flex: 1,
            borderRadius: 0,
            boxShadow: 'none',
            border: 'none',
            '& .MuiPaper-root': {
              borderRadius: 0,
            },
          }
        }}
      />
    </Box>
  );
}