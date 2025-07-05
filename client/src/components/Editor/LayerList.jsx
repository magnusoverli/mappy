import {
  Box,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useSearch } from '../../hooks/useSearch.jsx';
import EntryList from '../Common/EntryList.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const LayerList = ({ layers = [], selected, onSelect, onDelete, onError }) => {
  const header = null;
  const footer = null; // Remove the "+" button

  const [menuPosition, setMenuPosition] = useState(null);
  const [activeMenuLayer, setActiveMenuLayer] = useState(null);
  const [confirmLayer, setConfirmLayer] = useState(null);

  const { query, matchSet, currentResult, counts } = useSearch() || {};
  const theme = useTheme();
  const highlight = theme.palette.mode === 'light'
    ? 'rgba(255, 245, 157, 0.5)'
    : 'rgba(249, 168, 37, 0.3)';

  const renderRow = (layer, _i, style) => {
    const isMatch = matchSet?.has(layer.key);
    const isCurrent = currentResult?.key === layer.key;
    return (
      <Box
        style={style}
        key={layer.key}
        sx={{ position: 'relative', '&:hover .layer-menu-btn': { opacity: 1 } }}
      >
        <ListItemButton
          selected={layer.key === selected}
          onClick={() => onSelect(layer.key)}
          sx={{
            height: '100%',
            minHeight: 0,
            py: 0,
            pr: 4,
            mb: 0.5,
            borderRadius: 1,
            transition: 'background-color 0.3s',
            '&.Mui-selected': { bgcolor: 'action.selected' },
            ...(isMatch && { bgcolor: highlight }),
            ...(query && !isMatch && { opacity: 0.7 }),
            ...(isCurrent && { animation: 'pulseHighlight 1.5s infinite' }),
          }}
        >
          <ListItemText
            primary={formatLayerLabel(layer.key, layer.value)}
            primaryTypographyProps={{
              noWrap: true,
              sx: { fontFamily: '"JetBrains Mono", monospace' },
            }}
          />
        </ListItemButton>
        <IconButton
          className="layer-menu-btn"
          size="small"
          onClick={e => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({ top: rect.bottom, left: rect.left });
            setActiveMenuLayer(layer.key);
          }}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0,
            transition: 'opacity 0.1s',
            color: 'action.disabled',
            p: '4px',
            '&:hover': { color: 'action.active' },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const longestLabel = layers.reduce((acc, l) => {
    const label = formatLayerLabel(l.key, l.value);
    return label.length > acc.length ? label : acc;
  }, '');

  const measureRef = useRef(null);
  const [width, setWidth] = useState('auto');

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (!cancelled && measureRef.current) {
        // Use getBoundingClientRect for more accurate measurement
        const rect = measureRef.current.getBoundingClientRect();
        
        // Get the scrollWidth to ensure we capture the full content
        const contentWidth = measureRef.current.scrollWidth;
        
        // Use the larger of the two measurements
        const measuredWidth = Math.max(rect.width, contentWidth);
        
        // Add extra padding for the Paper component and some buffer
        // Paper has theme spacing 2 (16px each side) plus some buffer for safety
        const totalWidth = Math.ceil(measuredWidth) + 32 + 24;
        
        setWidth(`${totalWidth}px`);
      }
    };

    // Delay measurement slightly to ensure DOM is ready
    setTimeout(measure, 0);

    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      document.fonts.ready.then(() => {
        setTimeout(measure, 0);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [longestLabel]);

  const handleMenuClose = () => {
    setMenuPosition(null);
    setActiveMenuLayer(null);
  };

  const handleDeleteClick = () => {
    if (layers.length <= 1) {
      onError && onError('Cannot delete the last remaining layer');
      handleMenuClose();
      return;
    }
    setConfirmLayer(activeMenuLayer);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (onDelete) onDelete(confirmLayer);
    setConfirmLayer(null);
  };

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <ListItemButton
          ref={measureRef}
          sx={{
            px: 2,
            pr: 4,
            mb: 0.5,
            height: '100%',
            minHeight: 0,
            py: 0,
            borderRadius: 1,
          }}
        >
          <ListItemText
            primary={longestLabel}
            primaryTypographyProps={{ sx: { fontFamily: '"JetBrains Mono", monospace' } }}
          />
        </ListItemButton>
      </Box>
      <EntryList
        title={`Layers${query ? ` (${counts?.layers || 0})` : ''}`}
        items={layers}
        renderRow={renderRow}
        header={header}
        footer={footer}
        paperProps={{ sx: { flex: '0 0 auto', width } }}
      />
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
        open={Boolean(menuPosition)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Layer
        </MenuItem>
      </Menu>
      <Dialog
        open={Boolean(confirmLayer)}
        onClose={() => setConfirmLayer(null)}
      >
        <DialogTitle>{`Delete Layer ${confirmLayer}?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLayer(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(LayerList);