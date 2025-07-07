import { Box, Paper } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import DataTable from './DataTable.jsx';
import MonospaceTextField from './MonospaceTextField.jsx';
import { useSearchHighlight } from '../../hooks/useSearchHighlight.js';
import { SPACING, FONTS } from '../../utils/styleConstants.js';

// Selection hook for multi-select functionality
function useMultiSelection(items, selected, onSelectionChange) {
  const containerRef = useRef(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        if (containerRef.current && containerRef.current.contains(e.target)) {
          const tag = e.target.tagName;
          const editable = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
          if (!editable) {
            e.preventDefault();
            const allIndices = items.map((_, idx) => idx);
            onSelectionChange?.(allIndices);
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [items, onSelectionChange]);

  const handleRowClick = useCallback((index, e) => {
    if (e.shiftKey && selected.length > 0) {
      // Range selection
      const lastIndex = selected[selected.length - 1];
      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);
      const range = [];
      for (let i = start; i <= end; i++) range.push(i);
      onSelectionChange?.(range);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelected = selected.includes(index)
        ? selected.filter(i => i !== index)
        : [...selected, index];
      onSelectionChange?.(newSelected);
    } else {
      // Single selection
      onSelectionChange?.([index]);
    }
  }, [selected, onSelectionChange]);

  const handleRowMouseDown = useCallback((e) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return { containerRef, handleRowClick, handleRowMouseDown };
}

export default function EditableDataTable({
  title,
  items = [],
  selected = [],
  onSelectionChange,
  onItemChange,
  itemHeight = 36,
  paperProps = {},
  validateKey,
  validateValue,
  keyWidth = '11ch',
  valueWidth = '11ch',
  showOffset = true,
}) {
  const { containerRef, handleRowClick, handleRowMouseDown } = useMultiSelection(items, selected, onSelectionChange);

  // Custom header for editable lists
  const editableHeader = (
    <Box sx={{ 
      display: 'flex', 
      fontWeight: 'bold', 
      mb: 1, 
      fontFamily: FONTS.MONOSPACE, 
      alignItems: 'center' 
    }}>
      <Box sx={{ width: keyWidth, minWidth: keyWidth }}>Key</Box>
      <Box sx={{ mx: 1.5, minWidth: '1ch', textAlign: 'center' }}></Box>
      <Box sx={{ width: valueWidth, minWidth: valueWidth }}>Value</Box>
      {showOffset && <Box sx={{ flex: 1, textAlign: 'right', ml: 2 }}>Offset</Box>}
    </Box>
  );

  // Custom row renderer for editable items
  const renderEditableRow = useCallback((item, index, style) => {
    // Create a component to properly use hooks
    function EditableRowContent({ item, index, style }) {
      const { styles } = useSearchHighlight(item);
    const isSelected = selected.includes(index);
    
    const handleCellChange = (field, value) => {
      onItemChange?.(index, field, value);
    };

    const handleFieldClick = (e) => {
      e.stopPropagation();
      // Deselect range when user clicks to edit a field
      if (selected.length > 1) {
        onSelectionChange?.([]);
      }
    };

    const handleFieldMouseDown = (e) => {
      e.stopPropagation();
    };
    
    return (
      <Paper
        style={style}
        key={index}
        onMouseDown={handleRowMouseDown}
        onClick={e => handleRowClick(index, e)}
        sx={theme => {
          const base = {
            mb: SPACING.MARGIN_SMALL,
            display: 'flex',
            alignItems: 'center',
            px: SPACING.PADDING.SMALL,
            py: 0,
            minHeight: 0,
            borderRadius: SPACING.BORDER_RADIUS,
            transition: 'background-color 0.3s',
            '&:hover': { bgcolor: 'action.hover' },
            ...styles,
          };
          
          // Add subtle alternating row colors
          if (!isSelected && !styles.bgcolor) {
            base.bgcolor = index % 2 === 0 
              ? 'transparent' 
              : theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.02)' 
                : 'rgba(0, 0, 0, 0.02)';
          }
          
          if (isSelected) {
            base.boxShadow = `0 0 0 2px ${theme.palette.primary.main} inset`;
            if (!styles.bgcolor) base.bgcolor = 'action.selected';
          }
          return base;
        }}
      >
        <MonospaceTextField
          value={item.key}
          onChange={e => handleCellChange('key', e.target.value)}
          onClick={handleFieldClick}
          onMouseDown={handleFieldMouseDown}
          error={validateKey ? !validateKey(item.key) : false}
          sx={{ width: keyWidth, minWidth: keyWidth }}
        />
        <Box
          sx={{
            mx: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.MONOSPACE,
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            userSelect: 'none',
            minWidth: '1ch',
          }}
        >
          =
        </Box>
        <MonospaceTextField
          value={item.value}
          onChange={e => handleCellChange('value', e.target.value)}
          onClick={handleFieldClick}
          onMouseDown={handleFieldMouseDown}
          error={validateValue ? !validateValue(item.value) : false}
          sx={{ width: valueWidth, minWidth: valueWidth }}
        />
        {showOffset && (
          <Box
            sx={{
              flex: 1,
              textAlign: 'right',
              fontFamily: FONTS.MONOSPACE,
              color: item.offset === 0 ? 'success.dark' : 'error.dark',
              ml: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {item.offset}
          </Box>
        )}
      </Paper>
    );
    }
    
    return <EditableRowContent item={item} index={index} style={style} />;
  }, [selected, onSelectionChange, onItemChange, validateKey, validateValue, keyWidth, valueWidth, showOffset, handleRowClick, handleRowMouseDown]);

  return (
    <div ref={containerRef}>
      <DataTable
        title={title}
        items={items}
        renderRow={renderEditableRow}
        header={editableHeader}
        footer={null}
        itemHeight={itemHeight}
        paperProps={paperProps}
      />
    </div>
  );
}