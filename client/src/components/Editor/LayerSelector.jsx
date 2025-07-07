import {
  Box,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { memo, useCallback } from 'react';
import { useSearch } from '../../hooks/useSearch.jsx';
import { useSearchHighlight } from '../../hooks/useSearchHighlight.js';
import { useAutoWidth } from '../../hooks/useAutoWidth.js';
import DataTable from '../Common/DataTable.jsx';
import { formatLayerLabel } from '../../utils/formatLayerLabel.js';
import { SPACING, FONTS } from '../../utils/styleConstants.js';

const LayerSelector = ({ layers = [], selected, onSelect }) => {
  const { query, counts } = useSearch() || {};

  // Calculate the longest label for width measurement
  const longestLabel = layers.reduce((acc, l) => {
    const label = formatLayerLabel(l.key, l.value);
    return label.length > acc.length ? label : acc;
  }, '');

  // Use the optimized auto-width hook
  const { measureRef, width } = useAutoWidth(longestLabel, [longestLabel]);

  // Custom row renderer for layers
  const renderLayerRow = useCallback((layer, index, style) => {
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

    return <LayerRow layer={layer} style={style} />;
  }, [selected, onSelect]);

  return (
    <>
      {/* Hidden measurement element */}
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

      {/* Actual list using BaseList */}
      <DataTable
        title={`Layers${query ? ` (${counts?.layers || 0})` : ''}`}
        items={layers}
        renderRow={renderLayerRow}
        header={null}
        footer={null}
        selectionMode="none" // LayerList handles its own selection
        enableSearchHighlight={false} // We handle highlighting in renderLayerRow
        paperProps={{ sx: { flex: '0 0 auto', width } }}
      />
    </>
  );
};

export default memo(LayerSelector);