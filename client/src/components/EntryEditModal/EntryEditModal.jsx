import { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  Box, 
  Slide, 
  useTheme 
} from '@mui/material';
import ModalHeader from './components/ModalHeader.jsx';
import ModalFooter from './components/ModalFooter.jsx';
import DataPanel from './components/DataPanel.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import useEntrySelection from './hooks/useEntrySelection.js';

const Transition = (props) => {
  return <Slide direction="down" {...props} />;
};

export default function EntryEditModal({ 
  open, 
  onClose, 
  layerData, 
  entryType, 
  onSave 
}) {
  const theme = useTheme();
  const [entries, setEntries] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    selectedItems,
    handleSelection,
    clearSelection,
    selectAll,
    updateSelectionAfterTransform
  } = useEntrySelection();

  useEffect(() => {
    if (open && layerData) {
      const entryList = entryType === 'Targets' ? layerData.targets : layerData.sources;
      setEntries(entryList || []);
      clearSelection();
      setHasChanges(false);
      setSearchQuery('');
    }
  }, [open, layerData, entryType, clearSelection]);

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.key.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query) ||
      entry.offset.toString().includes(query)
    );
  });

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setProcessing(true);
    try {
      await onSave(entries);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const updateEntries = (newEntries, keyMapping = null) => {
    setEntries(newEntries);
    setHasChanges(true);
    
    // Update selection if keys have changed
    if (keyMapping) {
      updateSelectionAfterTransform(keyMapping);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    // Only handle Ctrl+A when not in an input field
    if (event.ctrlKey && event.key === 'a') {
      const target = event.target;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true' ||
                          target.closest('input') ||
                          target.closest('textarea') ||
                          target.closest('[contenteditable="true"]');
      
      if (!isInputField && filteredEntries.length > 0) {
        event.preventDefault();
        selectAll(filteredEntries);
      }
    }
  }, [filteredEntries, selectAll]);

  // Add keyboard event listener
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      transitionDuration={300}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '65vw',
          height: '85vh',
          maxWidth: 'none',
          maxHeight: 'none',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      <ModalHeader
        layerName={layerData?.name || 'Unknown Layer'}
        entryType={entryType}
        onClose={handleClose}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default
      }}>
        <DataPanel
          entries={filteredEntries}
          selectedItems={selectedItems}
          onSelection={handleSelection}
        />
        
        <ControlPanel
          entries={entries}
          selectedItems={selectedItems}
          onUpdateEntries={updateEntries}
          processing={processing}
        />
      </Box>
      
      <ModalFooter
        hasChanges={hasChanges}
        processing={processing}
        onCancel={handleClose}
        onSave={handleSave}
      />
    </Dialog>
  );
}