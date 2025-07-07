import { Box } from '@mui/material';
import { useSearchHighlight } from '../../hooks/useSearchHighlight.js';
import { SPACING, FONTS } from '../../utils/styleConstants.js';

const EntryRow = ({ 
  item, 
  style, 
  selected = false, 
  onClick, 
  onMouseDown,
  children 
}) => {
  const { styles } = useSearchHighlight(item);
  
  return (
    <Box style={style} key={item.key}>
      <Box
        onClick={onClick}
        onMouseDown={onMouseDown}
        sx={{
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: 0.5,
          borderRadius: SPACING.BORDER_RADIUS,
          transition: 'background-color 0.3s',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
          ...(selected && { boxShadow: '0 0 0 2px primary.main inset' }),
          ...styles,
        }}
      >
        {children || (
          <Box sx={{ display: 'flex', width: '100%', px: SPACING.PADDING.MEDIUM }}>
            <Box sx={{ width: '40%', fontFamily: FONTS.MONOSPACE }}>
              {item.key}
            </Box>
            <Box sx={{ width: '40%', fontFamily: FONTS.MONOSPACE }}>
              {item.value}
            </Box>
            <Box sx={{
              width: '20%',
              textAlign: 'right',
              fontFamily: FONTS.MONOSPACE,
              color: item.offset === 0 ? 'success.dark' : 'error.dark',
            }}>
              {item.offset}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntryRow;