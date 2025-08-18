import { forwardRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import VirtualizedList from './VirtualizedList.jsx';
import { useSearchHighlight } from '../../hooks/useSearchHighlight.js';
import { SPACING, FONTS } from '../../utils/styleConstants.js';

// Default row component for key-value-offset display
function DefaultRow({ item, style }) {
  const { styles } = useSearchHighlight(item);
  
  return (
    <Box style={style} key={item.key}>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: SPACING.MARGIN_SMALL,
          borderRadius: SPACING.BORDER_RADIUS,
          transition: 'background-color 0.3s',
          ...styles,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', px: SPACING.PADDING.MEDIUM }}>
          <Box sx={{ width: '40%', fontFamily: FONTS.MONOSPACE }}>{item.key}</Box>
          <Box sx={{ width: '40%', fontFamily: FONTS.MONOSPACE }}>{item.value}</Box>
          <Box
            sx={{
              width: '20%',
              textAlign: 'right',
              fontFamily: FONTS.MONOSPACE,
              color: item.offset === 0 ? 'success.dark' : 'error.dark',
            }}
          >
            {item.offset}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Default header for key-value-offset display
function DefaultHeader() {
  return (
    <Box sx={{ display: 'flex', px: SPACING.PADDING.MEDIUM, fontWeight: 'bold', fontFamily: FONTS.MONOSPACE }}>
      <Box sx={{ width: '40%' }}>Key</Box>
      <Box sx={{ width: '40%' }}>Value</Box>
      <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
    </Box>
  );
}

const DataTable = forwardRef(({
  title,
  items = [],
  renderRow,
  header,
  footer,
  itemHeight = 36,
  paperProps = {},
}, ref) => {
  // Use custom renderer or default key-value-offset renderer
  const rowRenderer = renderRow || ((item, index, style) => <DefaultRow item={item} style={style} />);

  // Use custom header or default key-value-offset header
  const headerComponent = header !== undefined ? header : <DefaultHeader />;

  return (
    <Paper
      {...paperProps}
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(paperProps.sx || {}),
      }}
    >
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      {headerComponent}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedList
          ref={ref}
          items={items}
          itemHeight={itemHeight}
          renderRow={rowRenderer}
        />
      </Box>
      {footer || null}
    </Paper>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;