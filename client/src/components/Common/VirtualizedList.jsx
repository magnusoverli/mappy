import { memo } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualizedList = ({ items = [], itemHeight = 36, renderRow }) => {
  if (typeof renderRow !== 'function') return null;
  return (
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
  );
};

export default memo(VirtualizedList);
