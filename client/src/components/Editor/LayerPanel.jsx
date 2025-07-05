import { Box, Paper, Typography, ListItem } from '@mui/material';
import { memo } from 'react';
import VirtualizedList from '../Common/VirtualizedList.jsx';

const LayerPanel = ({ targets, sources }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Targets
          </Typography>
        <Box sx={{ display: 'flex', px: 1, fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}>
            <Box sx={{ width: '40%' }}>Key</Box>
            <Box sx={{ width: '40%' }}>Value</Box>
            <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <VirtualizedList
              items={targets}
              itemHeight={36}
              renderRow={(t, _i, style) => (
                <ListItem style={style} key={t.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{t.key}</Box>
                    <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{t.value}</Box>
                    <Box
                      sx={{
                        width: '20%',
                        textAlign: 'right',
                        fontFamily: '"JetBrains Mono", monospace',
                        color: t.offset === 0 ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {t.offset}
                    </Box>
                  </Box>
                </ListItem>
              )}
            />
          </Box>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Sources
          </Typography>
          <Box sx={{ display: 'flex', px: 1, fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}>
            <Box sx={{ width: '40%' }}>Key</Box>
            <Box sx={{ width: '40%' }}>Value</Box>
            <Box sx={{ width: '20%', textAlign: 'right' }}>Offset</Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <VirtualizedList
              items={sources}
              itemHeight={36}
              renderRow={(s, _i, style) => (
                <ListItem style={style} key={s.key} sx={{ mb: 0.5, borderRadius: 1, '&:hover': { boxShadow: 2 } }}>
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{s.key}</Box>
                    <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>{s.value}</Box>
                    <Box
                      sx={{
                        width: '20%',
                        textAlign: 'right',
                        fontFamily: '"JetBrains Mono", monospace',
                        color: s.offset === 0 ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {s.offset}
                    </Box>
                  </Box>
                </ListItem>
              )}
            />
          </Box>
        </Paper>
    </Box>
  );
};

export default memo(LayerPanel);

