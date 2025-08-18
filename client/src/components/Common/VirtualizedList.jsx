import { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@mui/material';
import { SPACING } from '../../utils/styleConstants.js';

const VirtualizedList = forwardRef(({ items = [], itemHeight = SPACING.ITEM_HEIGHT, renderRow }, ref) => {
  const listRef = useRef(null);
  
  // Expose scroll methods to parent components
  useImperativeHandle(ref, () => ({
    scrollToItem: (index, align = 'start') => {
      if (listRef.current && index >= 0 && index < items.length) {
        listRef.current.scrollToItem(index, align);
      }
    },
    scrollTo: (scrollOffset) => {
      if (listRef.current) {
        listRef.current.scrollTo(scrollOffset);
      }
    }
  }));
  
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
            ref={listRef}
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
});

VirtualizedList.displayName = 'VirtualizedList';

export default memo(VirtualizedList);
