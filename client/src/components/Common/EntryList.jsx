import { Box, ListItemButton, Paper, Typography } from '@mui/material';
import VirtualizedList from './VirtualizedList.jsx';

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

  const defaultRow = (item, _i, style) => (
    <ListItemButton
      style={style}
      key={item.key}
      sx={{
        mb: 0.5,
        borderRadius: 1,
        height: '100%',
        minHeight: 0,
        py: 0,
        '&:hover': { boxShadow: 2 },
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
