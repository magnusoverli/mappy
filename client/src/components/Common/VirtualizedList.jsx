import { memo } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@mui/material';
import { SPACING } from '../../utils/styleConstants.js';

const VirtualizedList = ({ items = [], itemHeight = SPACING.ITEM_HEIGHT, renderRow }) => {
  if (typeof renderRow !== 'function') return null;
  return (
    <Box
      sx={{
        height: '100%',
        '& > div': {
          // Target the react-window container
          '& > div': {
            // Auto-hide scrollbar styles
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              opacity: 1,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0,0,0,0.4)',
            },
          },
        },
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
          >
            {({ index, style }) => renderRow(items[index], index, style)}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
};

export default memo(VirtualizedList);
