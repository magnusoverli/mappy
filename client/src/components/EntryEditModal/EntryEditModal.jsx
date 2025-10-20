import { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  Box, 
  Slide, 
  useTheme,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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
  const [processingMessage, setProcessingMessage] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
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
    }
  }, [open, layerData, entryType, clearSelection]);



  const handleClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setProcessing(true);
    setProcessingMessage('Saving changes...');
    try {
      await onSave(entries);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setProcessing(false);
      setProcessingMessage('');
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
      
      if (!isInputField && entries.length > 0) {
        event.preventDefault();
        selectAll(entries);
      }
    }
  }, [entries, selectAll]);

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
    <>
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
      />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default
      }}>
        <DataPanel
          entries={entries}
          selectedItems={selectedItems}
          onSelection={handleSelection}
        />
        
        <ControlPanel
          entries={entries}
          selectedItems={selectedItems}
          onUpdateEntries={updateEntries}
          processing={processing}
          setProcessing={setProcessing}
          setProcessingMessage={setProcessingMessage}
        />
      </Box>
      
      <ModalFooter
        hasChanges={hasChanges}
        processing={processing}
        processingMessage={processingMessage}
        onCancel={handleClose}
        onSave={handleSave}
      />
      </Dialog>

      <Dialog
        open={showCloseConfirm}
        onClose={handleCancelClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to close without saving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmClose} color="error" variant="contained">
            Close Without Saving
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}