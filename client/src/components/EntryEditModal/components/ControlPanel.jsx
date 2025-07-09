import { Box } from '@mui/material';
import AddEntriesSection from './AddEntriesSection.jsx';
import TransformSection from './TransformSection.jsx';

export default function ControlPanel({ 
  entries, 
  selectedItems, 
  onUpdateEntries, 
  processing 
}) {
  const handleAddEntries = (newEntries) => {
    const updatedEntries = [...entries, ...newEntries];
    onUpdateEntries(updatedEntries);
  };

  const handleDeleteSelected = () => {
    const updatedEntries = entries.filter(entry => !selectedItems.has(entry.key));
    onUpdateEntries(updatedEntries);
  };

  const handleApplyTransform = (transformedEntries, keyMapping) => {
    onUpdateEntries(transformedEntries, keyMapping);
  };

  return (
    <Box
      sx={{
        width: 450,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <AddEntriesSection
        entries={entries}
        selectedItems={selectedItems}
        onAddEntries={handleAddEntries}
        onDeleteSelected={handleDeleteSelected}
        processing={processing}
      />
      
      <TransformSection
        entries={entries}
        selectedItems={selectedItems}
        onApplyTransform={handleApplyTransform}
        processing={processing}
      />
    </Box>
  );
}