import { useState, useCallback } from 'react';

export default function useEntrySelection() {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  const handleSelection = useCallback((item, index, event, entries = []) => {
    const itemKey = item.key;
    
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      
      if (event.ctrlKey || event.metaKey) {
        // Ctrl+click: toggle selection
        if (newSelection.has(itemKey)) {
          newSelection.delete(itemKey);
        } else {
          newSelection.add(itemKey);
        }
        setLastSelectedIndex(index);
      } else if (event.shiftKey && lastSelectedIndex !== null && entries.length > 0) {
        // Shift+click: select range
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        
        for (let i = start; i <= end; i++) {
          if (entries[i]) {
            newSelection.add(entries[i].key);
          }
        }
      } else {
        // Regular click: single selection
        newSelection.clear();
        newSelection.add(itemKey);
        setLastSelectedIndex(index);
      }
      
      return newSelection;
    });
  }, [lastSelectedIndex]);

  const selectRange = useCallback((entries, startIndex, endIndex) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);
      
      for (let i = start; i <= end; i++) {
        if (entries[i]) {
          newSelection.add(entries[i].key);
        }
      }
      
      return newSelection;
    });
  }, []);

  const selectAll = useCallback((entries) => {
    setSelectedItems(new Set(entries.map(entry => entry.key)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback((itemKey) => {
    return selectedItems.has(itemKey);
  }, [selectedItems]);

  const getSelectedEntries = useCallback((entries) => {
    return entries.filter(entry => selectedItems.has(entry.key));
  }, [selectedItems]);

  const updateSelectionAfterTransform = useCallback((keyMapping) => {
    setSelectedItems(prev => {
      const newSelection = new Set();
      prev.forEach(oldKey => {
        const newKey = keyMapping[oldKey] || oldKey;
        newSelection.add(newKey);
      });
      return newSelection;
    });
  }, []);

  return {
    selectedItems,
    lastSelectedIndex,
    handleSelection,
    selectRange,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedEntries,
    updateSelectionAfterTransform,
    selectedCount: selectedItems.size,
  };
}