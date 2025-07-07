import {
  Box,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useSearch } from '../../hooks/useSearch.jsx';
import { useSearchHighlight } from '../../hooks/useSearchHighlight.js';
import EntryList from '../Common/EntryList.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';
import { SPACING, FONTS } from '../../utils/styleConstants.js';

const LayerList = ({ layers = [], selected, onSelect }) => {
  const header = null;
  const footer = null; // Remove the "+" button



  const { query, counts } = useSearch() || {};

  // Create a component for the row to use hooks properly
  const LayerRow = ({ layer, style }) => {
    const { styles } = useSearchHighlight(layer);
    
    return (
      <Box style={style} key={layer.key}>
        <ListItemButton
          selected={layer.key === selected}
          onClick={() => onSelect(layer.key)}
          sx={{
            height: '100%',
            minHeight: 0,
            py: 0,
            mb: SPACING.MARGIN_SMALL,
            borderRadius: SPACING.BORDER_RADIUS,
            transition: 'background-color 0.3s',
            '&.Mui-selected': { bgcolor: 'action.selected' },
            ...styles,
          }}
        >
          <ListItemText
            primary={formatLayerLabel(layer.key, layer.value)}
            primaryTypographyProps={{
              noWrap: true,
              sx: { fontFamily: FONTS.MONOSPACE },
            }}
          />
        </ListItemButton>
      </Box>
    );
  };

  const renderRow = (layer, _i, style) => <LayerRow layer={layer} style={style} />;

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
            px: SPACING.PADDING.MEDIUM,
            mb: SPACING.MARGIN_SMALL,
            height: '100%',
            minHeight: 0,
            py: 0,
            borderRadius: SPACING.BORDER_RADIUS,
          }}
        >
          <ListItemText
            primary={longestLabel}
            primaryTypographyProps={{ sx: { fontFamily: FONTS.MONOSPACE } }}
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


    </>
  );
};

export default memo(LayerList);