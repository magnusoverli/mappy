import { Box, ListItem, Paper, Typography } from '@mui/material';
import VirtualizedList from './VirtualizedList.jsx';

export default function EntryList({ title, items = [] }) {
  return (
    <Paper
      sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', px: 1, fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}>
        <Box sx={{ width: '40%' }}>Key</Box>
        <Box sx={{ width: '40%' }}>Value</Box>
        <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedList
          items={items}
          itemHeight={36}
          renderRow={(item, _i, style) => (
            <ListItem
              style={style}
              key={item.key}
              sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}
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
            </ListItem>
          )}
        />
      </Box>
    </Paper>
  );
}
