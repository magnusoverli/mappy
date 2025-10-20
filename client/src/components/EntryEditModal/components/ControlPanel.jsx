import { Box } from '@mui/material';
import EntryEditSection from './EntryEditSection.jsx';
import AddEntriesSection from './AddEntriesSection.jsx';
import TransformSection from './TransformSection.jsx';

export default function ControlPanel({ 
  entries, 
  selectedItems, 
  onUpdateEntries, 
  processing,
  setProcessing,
  setProcessingMessage
}) {
  const handleAddEntries = async (newEntries) => {
    setProcessing(true);
    setProcessingMessage('Adding entries...');
    
    try {
      // Small delay for user feedback, especially for large batches
      await new Promise(resolve => setTimeout(resolve, Math.min(50, newEntries.length * 5)));
      const updatedEntries = [...entries, ...newEntries];
      onUpdateEntries(updatedEntries);
    } finally {
      setProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDeleteSelected = async () => {
    setProcessing(true);
    setProcessingMessage('Deleting entries...');
    
    try {
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 50));
      const updatedEntries = entries.filter(entry => !selectedItems.has(entry.key));
      onUpdateEntries(updatedEntries);
    } finally {
      setProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleApplyTransform = async (transformedEntries, keyMapping) => {
    setProcessing(true);
    setProcessingMessage('Applying transformation...');
    
    try {
      // Small delay to show the indicator for user feedback
      await new Promise(resolve => setTimeout(resolve, 100));
      onUpdateEntries(transformedEntries, keyMapping);
    } finally {
      setProcessing(false);
      setProcessingMessage('');
    }
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
      <EntryEditSection
        entries={entries}
        selectedItems={selectedItems}
        onUpdateEntries={onUpdateEntries}
        processing={processing}
      />
      
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