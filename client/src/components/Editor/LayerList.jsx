import {
  Box,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Snackbar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import EntryList from '../Common/EntryList.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';

const LayerList = ({ layers = [], selected, onSelect, onRemove }) => {
  const header = null;
  const footer = null; // Remove the "+" button

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeMenuLayer, setActiveMenuLayer] = useState(null);
  const [confirmLayer, setConfirmLayer] = useState(null);
  const [error, setError] = useState('');

  const handleMenuOpen = (e, key) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setActiveMenuLayer(key);
  };

  const renderRow = (layer, _i, style) => (
    <Box style={style} key={layer.key}>
      <ListItemButton
        selected={layer.key === selected}
        onClick={() => onSelect(layer.key)}
        sx={{
          position: 'relative',
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: 0.5,
          pr: 4,
          borderRadius: 1,
          '&.Mui-selected': { bgcolor: 'action.selected' },
          '&:hover .layer-menu-btn': { opacity: 1 },
        }}
      >
        <ListItemText
          primary={formatLayerLabel(layer.key, layer.value)}
          primaryTypographyProps={{ noWrap: true, sx: { fontFamily: '"JetBrains Mono", monospace' } }}
        />
        <IconButton
          className="layer-menu-btn"
          size="small"
          onClick={e => handleMenuOpen(e, layer.key)}
          sx={{
            p: '4px',
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'action.disabled',
            opacity: 0,
            transition: 'opacity 100ms',
            '&:hover': { color: 'action.active' },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    </Box>
  );

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
        const totalWidth = Math.ceil(measuredWidth) + 32 + 16;
        
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
    setMenuAnchor(null);
    setActiveMenuLayer(null);
  };

  const handleDelete = () => {
    if (layers.length === 1) {
      setError('Cannot delete the last layer');
      handleMenuClose();
      return;
    }
    setConfirmLayer(activeMenuLayer);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (onRemove && confirmLayer) onRemove(confirmLayer);
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
        title="Layers"
        items={layers}
        renderRow={renderRow}
        header={header}
        footer={footer}
        paperProps={{ sx: { flex: '0 0 auto', width } }}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Layer
        </MenuItem>
      </Menu>
      <Dialog open={Boolean(confirmLayer)} onClose={() => setConfirmLayer(null)}>
        <DialogTitle>
          {`Delete Layer ${confirmLayer}? This action cannot be undone.`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmLayer(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(error)}
        onClose={() => setError('')}
        autoHideDuration={3000}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default memo(LayerList);