import { Box, ListItemButton, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VirtualizedList from './VirtualizedList.jsx';
import { useSearch } from '../../hooks/useSearch.jsx';

export default function EntryList({
  title,
  items = [],
  renderRow,
  header,
  footer,
  itemHeight = 36,
  paperProps = {},
}) {
  const defaultHeader = (
    <Box sx={{ display: 'flex', px: 1, fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}>
      <Box sx={{ width: '40%' }}>Key</Box>
      <Box sx={{ width: '40%' }}>Value</Box>
      <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
    </Box>
  );

  const { query, matchSet, currentResult } = useSearch() || {};
  const theme = useTheme();
  const highlight = theme.palette.mode === 'light'
    ? 'rgba(255, 245, 157, 0.3)'
    : 'rgba(249, 168, 37, 0.15)';
  const currentHighlight = theme.palette.mode === 'light'
    ? 'rgba(255, 245, 157, 0.8)'
    : 'rgba(249, 168, 37, 0.45)';

  const defaultRow = (item, _i, style) => (
    <Box style={style} key={item.key}>
      <ListItemButton
        sx={{
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.3s',
          '&.Mui-selected': { bgcolor: 'action.selected' },
          ...(matchSet?.has(item.key) && { bgcolor: highlight }),
          ...(query && !matchSet?.has(item.key) && { opacity: 0.7 }),
          ...(currentResult?.key === item.key && { bgcolor: currentHighlight }),
        }}
      >
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{item.key}</Box>
          <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{item.value}</Box>
        <Box
          sx={{
            width: '20%',
            textAlign: 'right',
            fontFamily: '"JetBrains Mono", monospace',
            color: item.offset === 0 ? 'success.dark' : 'error.dark',
          }}
        >
          {item.offset}
        </Box>
        </Box>
      </ListItemButton>
    </Box>
  );

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
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {header !== undefined ? header : defaultHeader}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedList
          items={items}
          itemHeight={itemHeight}
          renderRow={renderRow || defaultRow}
        />
      </Box>
      {footer || null}
    </Paper>
  );
}
